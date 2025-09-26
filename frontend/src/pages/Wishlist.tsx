import React from 'react';
import WishlistSystem from '@/components/WishlistSystem';

const Wishlist: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <WishlistSystem showButton={false} />
    </div>
  );
};

export default Wishlist;