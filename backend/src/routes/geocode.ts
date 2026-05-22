import { Router, Request, Response } from 'express';
import https from 'https';

const router = Router();

// Helper to make a secure request ignoring TLS certificate expiration
const fetchPincodeFallback = (pinCode: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.postalpincode.in/pincode/${pinCode}`;
    const options = {
      rejectUnauthorized: false, // Ignore expired SSL certificate on the postal server
      headers: {
        'User-Agent': 'KayakaSampadaFPO-PWA/1.0'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch from postal API: Status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse postal API response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Helper for standard HTTPS GET
const fetchHttps = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Fetch failed with status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse JSON'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// GET /api/geocode/:pin_code
router.get('/:pin_code', async (req: Request, res: Response): Promise<void> => {
  const { pin_code } = req.params;

  // Validate Indian PIN code format (6 digits)
  if (!/^\d{6}$/.test(pin_code)) {
    res.status(400).json({ error: 'PIN code must be exactly 6 digits.' });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log(`[Geocode API] Request received for PIN code: ${pin_code}. API Key present: ${!!apiKey}`);

  // Try Google Maps Geocoding API first
  if (apiKey && apiKey !== 'your_google_maps_api_key_here') {
    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pin_code}&components=country:IN&key=${apiKey}`;
      const googleData = await fetchHttps(googleUrl);

      if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
        const components = googleData.results[0].address_components;
        let city = '';
        let district = '';
        let state = '';
        let country = '';

        for (const comp of components) {
          if (comp.types.includes('locality') || comp.types.includes('postal_town') || comp.types.includes('administrative_area_level_3') || comp.types.includes('sublocality_level_1')) {
            if (!city) city = comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_2')) {
            district = comp.long_name;
          }
          if (comp.types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          }
          if (comp.types.includes('country')) {
            country = comp.long_name;
          }
        }

        console.log(`[Geocode API] Google Maps successfully resolved location for PIN code ${pin_code}: ${city}, ${district}, ${state}, ${country}`);
        // Return resolved location
        res.json({
          city: city || district,
          district: district || city,
          state: state,
          country: country || 'India'
        });
        return;
      } else {
        console.warn(`[Geocode API] Google Maps Geocoding returned non-OK status: "${googleData.status}". Error Message: "${googleData.error_message || 'None'}". Falling back to postal API...`);
      }
    } catch (err: any) {
      console.error('[Geocode API] Google Geocoding error, falling back to Indian Post API:', err.message || err);
    }
  } else {
    console.log('[Geocode API] Google Maps API key is missing or not configured. Falling back to postal API...');
  }

  // Fallback to Indian Post PIN code API
  try {
    console.log(`[Geocode API] Attempting fallback for PIN code ${pin_code} using Indian Post API...`);
    const postData = await fetchPincodeFallback(pin_code);

    if (postData && postData[0] && postData[0].Status === 'Success' && postData[0].PostOffice && postData[0].PostOffice.length > 0) {
      const po = postData[0].PostOffice[0];
      const state = po.State;
      const district = po.District;
      const country = po.Country || 'India';
      // Use Block for Taluk/City, if NA use District or Name
      const city = po.Block && po.Block !== 'NA' ? po.Block : (po.District || po.Name);

      console.log(`[Geocode API] Postal API successfully resolved location for PIN code ${pin_code}: ${city}, ${district}, ${state}, ${country}`);
      res.json({
        city: city,
        district: district,
        state: state,
        country: country
      });
    } else {
      const postalStatus = postData && postData[0] ? postData[0].Status : 'Unknown';
      const postalMessage = postData && postData[0] ? postData[0].Message : 'No details';
      console.warn(`[Geocode API] Postal API returned status: "${postalStatus}" with message: "${postalMessage}". PIN code not found.`);
      res.status(404).json({ error: 'PIN code not found. Please enter details manually.' });
    }
  } catch (err: any) {
    console.error(`[Geocode API] Failed to resolve PIN code ${pin_code} via Postal API fallback:`, err.message || err);
    res.status(502).json({ error: 'Failed to auto-detect location. Please enter manually.' });
  }
});

export default router;
