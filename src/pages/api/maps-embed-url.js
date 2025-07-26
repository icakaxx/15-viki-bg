export default function handler(req, res) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = 'ChIJyUO26vXdq0ARjKoS9txlLIU';
  const url = `https://www.google.com/maps/embed/v1/place?key=${key}&q=place_id:${placeId}`;
  res.status(200).json({ url });
} 