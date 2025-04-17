import { useEffect, useState } from 'react';
import axios from 'axios';

const gateway = 'https://gateway.pinata.cloud/ipfs/';

const MetadataImageCards = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/pinned-images');
        const metadataCards = await Promise.all(
          data.metadataFiles.map(async (meta) => {
            try {
              const metaUrl = `${gateway}${meta.ipfs_pin_hash}`;
              const res = await axios.get(metaUrl);
              const metadata = res.data;

              return {
                name: metadata.name,
                symbol: metadata.symbol,
                royalty: metadata.royalty,
                imageHash: metadata.image?.split('ipfs://')[1],
              };
            } catch (err) {
              console.error('Metadata fetch error:', err);
              return null;
            }
          })
        );

        setCards(metadataCards.filter(Boolean));
      } catch (err) {
        console.error('Failed to load pinned data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Metadata-Based Images</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {cards.map((card, index) => (
          <div key={index} style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            background: '#fff'
          }}>
            <img
              src={`${gateway}${card.imageHash}`}
              alt={card.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '1rem',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}
              className="hover-meta"
            >
              <div><strong>Name:</strong> {card.name}</div>
              <div><strong>Symbol:</strong> {card.symbol}</div>
              <div><strong>Royalty:</strong> {card.royalty}%</div>
            </div>
            <style>{`
              div:hover > .hover-meta {
                opacity: 1 !important;
              }
            `}</style>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetadataImageCards;
