const axios = require('axios');

const PINATA_JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZTViMmM1MC0xMTJhLTQ4OTctOTEyYi1jZTJjMTE2MTA3MDIiLCJlbWFpbCI6IjNzdWhhc2hzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIwMmI0ZjQ5ZGM3NGQ3M2U1YTI4NCIsInNjb3BlZEtleVNlY3JldCI6ImM3NDI0OGU4ZDc1ODA3YzQxM2M2MzMwODYzY2ZmZThiMmU1YjdjOWFiMzliZmE4MWVhZWQ4MTgwZmEwZDZjZmQiLCJleHAiOjE3NzUzOTUxNDZ9.oRjV3hE7XL4OrkFukQc8AiUWySbeocw1KBCyqhlL70E';// Replace with your actual Pinata JWT

const getPinnedImages = async () => {
  try {
    const response = await axios.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000', {
      headers: {
        Authorization: PINATA_JWT,
        'Content-Type': 'application/json',
      },
    });

    const allFiles = response.data.rows;

    const metadataFiles = allFiles.filter(file => file.mime_type === 'application/json');
    const imageFiles = allFiles.filter(file => file.mime_type && file.mime_type.startsWith('image/'));

    return { metadataFiles, imageFiles };
  } catch (error) {
    console.error('Error fetching pinned files:', error);
    throw error;
  }
};

module.exports = getPinnedImages;
