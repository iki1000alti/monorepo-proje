import React from 'react';
import { Link } from 'react-router-dom';
import Slider from '../../components/Slider';

const Anasayfa = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-12">
      {/* Login Button - sağ üst köşe */}
      <div className="absolute top-4 right-4 z-50">
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold transition">Giriş Yap</Link>
      </div>
      {/* Slider */}
      <Slider slides={sliderProjectDetails.map(p => ({
        ...p,
        imageUrl: p.defaultImage || p.imageUrl || (p.imageUrls && p.imageUrls[0])
      }))} />
    </div>
  );
};

export default Anasayfa; 