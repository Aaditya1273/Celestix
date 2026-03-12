import './Testimonials.css';

const Testimonials = () => {
  const tweets = [
    {
      id: 1,
      avatar: 'https://pbs.twimg.com/profile_images/1923072273809801216/B2K1_X63_400x400.jpg',
     
    },
    {
      id: 2,
      avatar: 'https://pbs.twimg.com/profile_images/1918646280223608832/nqBF4zh__400x400.jpg',
     
    },
    {
      id: 3,
      avatar: 'https://pbs.twimg.com/profile_images/1794450494686932992/wqRqF4dt_400x400.jpg',
      
    },
    {
      id: 4,
      avatar: 'https://pbs.twimg.com/profile_images/1722358890807861248/75S7CB3G_400x400.jpg',
      
    },
    {
      id: 5,
      avatar: 'https://pbs.twimg.com/profile_images/1554006663853592576/Gxtolzbo_400x400.jpg',
      
    },
    {
      id: 6,
      avatar: 'https://pbs.twimg.com/profile_images/1880284612062056448/4Y2C8Xnv_400x400.jpg',
      
    },
    {
      id: 7,
      avatar: 'https://pbs.twimg.com/profile_images/1724192049002340352/-tood-4D_400x400.jpg',
      
    },
    {
      id: 8,
      avatar: 'https://pbs.twimg.com/profile_images/1885430699567513600/JP1m8cHY_400x400.jpg',
      
    },
    {
      id: 9,
      avatar: 'https://pbs.twimg.com/profile_images/1915754015381483520/07SpEJWa_400x400.jpg',
      
    }
  ];

  const row1Tweets = tweets.slice(0, 3);
  const row2Tweets = tweets.slice(3, 6);
  const row3Tweets = tweets.slice(6, 9);

  const TweetCard = ({ tweet }) => (
    <div
      className="testimonial-card"
      onClick={() => window.open(tweet.url, '_blank')}
    >
      <div className="testimonial-content">
        <p className="testimonial-text">{tweet.text}</p>
        <div className="testimonial-author">
          <img
            src={tweet.avatar}
            alt="Avatar"
            className="testimonial-avatar"
          />
          <span className="testimonial-handle">{tweet.handle}</span>
        </div>
      </div>
    </div>
  );

  const MarqueeRow = ({ tweets, direction = 'left', speed = 30 }) => {
    const duplicatedTweets = [...tweets, ...tweets, ...tweets, ...tweets];

    return (
      <div className="testimonial-row">
        <div
          className={`testimonial-marquee testimonial-marquee-${direction}`}
          style={{ '--speed': `${speed}s` }}
        >
          {duplicatedTweets.map((tweet, index) => (
            <TweetCard key={`${tweet.id}-${index}`} tweet={tweet} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h3 className="testimonials-title">Loved by devs worldwide</h3>
          <p className="testimonials-subtitle">
            See what developers are saying about Pixen Flow
          </p>
        </div>

        <div className="testimonials-marquee-container">
          <MarqueeRow tweets={row1Tweets} direction="left" speed={40} />
          <MarqueeRow tweets={row2Tweets} direction="right" speed={35} />
          <MarqueeRow tweets={row3Tweets} direction="left" speed={45} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
