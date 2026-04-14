export const SKIN_TONES = {
  fair: { label: 'Fair', color: '#FAEBD7', recs: ['Pastels','Lavender','Baby Blue','Rose Pink','Mint','Soft Yellow'], avoid: ['Neon','Very Dark Brown'], hexRecs: ['#E6E6FA','#B0C4DE','#FFB6C1','#98FB98','#FFFACD','#DDA0DD'], confidence: { Pastels: 92, Lavender: 88, 'Baby Blue': 85, 'Rose Pink': 90, Mint: 82, 'Soft Yellow': 78 } },
  light: { label: 'Light', color: '#F5DEB3', recs: ['Coral','Peach','Sky Blue','Cream','Light Purple','Soft White'], avoid: ['Orange','Neon Yellow'], hexRecs: ['#FF7F50','#FFDAB9','#87CEEB','#FFFDD0','#B19CD9','#F5F5F5'], confidence: { Coral: 90, Peach: 88, 'Sky Blue': 85, Cream: 82, 'Light Purple': 80, 'Soft White': 78 } },
  medium: { label: 'Medium', color: '#D2B48C', recs: ['Earthy Tones','Olive Green','Mustard','Burnt Orange','Teal','Brick Red'], avoid: ['Pastel Yellow','Pale Pink'], hexRecs: ['#8B7355','#808000','#FFDB58','#CC5500','#008080','#CB4154'], confidence: { 'Earthy Tones': 92, 'Olive Green': 88, Mustard: 90, 'Burnt Orange': 85, Teal: 87, 'Brick Red': 83 } },
  wheatish: { label: 'Wheatish', color: '#C68E56', recs: ['Gold','Bronze','Deep Green','Royal Blue','Maroon','Rust'], avoid: ['Nude','Very Light Beige'], hexRecs: ['#FFD700','#CD7F32','#006400','#4169E1','#800000','#B7410E'], confidence: { Gold: 95, Bronze: 90, 'Deep Green': 88, 'Royal Blue': 92, Maroon: 87, Rust: 85 } },
  dusky: { label: 'Dusky', color: '#8B6914', recs: ['Jewel Tones','Electric Blue','Fuchsia','Emerald','Wine','Bold Red'], avoid: ['Dusty Pink','Light Brown'], hexRecs: ['#9B59B6','#007FFF','#FF00FF','#50C878','#722F37','#FF0000'], confidence: { 'Jewel Tones': 93, 'Electric Blue': 90, Fuchsia: 88, Emerald: 92, Wine: 85, 'Bold Red': 87 } },
  dark: { label: 'Dark', color: '#5C4033', recs: ['White','Ivory','Bright Yellow','Hot Pink','Electric Blue','Bright Red'], avoid: ['Very Dark Navy','Dark Brown'], hexRecs: ['#FFFFFF','#FFFFF0','#FFFF00','#FF69B4','#007FFF','#FF0000'], confidence: { White: 95, Ivory: 90, 'Bright Yellow': 92, 'Hot Pink': 88, 'Electric Blue': 93, 'Bright Red': 90 } },
};

export const BODY_TYPES = {
  hourglass: { label: 'Hourglass', desc: 'Balanced bust and hips, defined waist.', dresses: ['Wrap Dresses', 'Bodycon', 'Fit-and-Flare', 'V-Neck Waist-Cinching'] },
  pear: { label: 'Pear', desc: 'Wider hips and thighs, narrower upper body.', dresses: ['A-Line Dresses', 'Off-Shoulder Styles', 'Empire Waist', 'Fit-and-Flare'] },
  apple: { label: 'Apple', desc: 'Broader upper body and midsection, narrower hips.', dresses: ['Empire Waist', 'Shift Dresses', 'Tunic Styles', 'Deep V-Necks'] },
  rectangle: { label: 'Rectangle', desc: 'Similar bust, waist, and hip measurements.', dresses: ['Ruched Dresses', 'Belted Shirt Dresses', 'Peplum Styles', 'Slip Dresses'] },
  'inverted-triangle': { label: 'Inverted Triangle', desc: 'Broad shoulders, narrow hips.', dresses: ['Pleated A-Line', 'Halter Neck', 'Full Skirts', 'Wrap Dresses'] },
  petite: { label: 'Petite', desc: 'Shorter frame under 5\'4" (162cm).', dresses: ['Mini Dresses', 'Vertical Stripes', 'Monochromatic Slips', 'Fitted Sheath'] },
  'plus-size': { label: 'Plus-Size', desc: 'Fuller figure.', dresses: ['Wrap Dresses', 'Maxi with Slit', 'Empire Waist', 'Structured Shift'] }
};

export const CATEGORIES = [
  { id: 'saree', name: 'Saree', image: 'https://images.unsplash.com/photo-1615886753457-418eb64811ec?auto=format&fit=crop&q=80&w=400' },
  { id: 'kurta', name: 'Kurta', image: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=400' },
  { id: 'western', name: 'Western', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400' },
  { id: 'ethnic', name: 'Ethnic', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400' },
  { id: 'casual', name: 'Casual', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400' },
  { id: 'formal', name: 'Formal', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=400' },
  { id: 'kids', name: 'Kids', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=400' },
  { id: 'mens', name: 'Mens', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=400' },
];

export const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const FABRICS = ['Cotton', 'Silk', 'Synthetic', 'Handloom', 'Linen', 'Chiffon', 'Georgette', 'Other'];

export const ORDER_STATUSES = {
  placed: { label: 'Placed', color: '#4A90C4', icon: '📦' },
  confirmed: { label: 'Confirmed', color: '#7A9E7E', icon: '✅' },
  packed: { label: 'Packed', color: '#E8872A', icon: '📦' },
  picked: { label: 'Picked Up', color: '#9B59B6', icon: '🚚' },
  'out-for-delivery': { label: 'Out for Delivery', color: '#E67E22', icon: '🛵' },
  delivered: { label: 'Delivered', color: '#27AE60', icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#E53E3E', icon: '❌' },
};
