import React from 'react'

const WhatClientsay = () => {
    const testimonials=[
        {
            id:1,
            name:"Ram Shrestha",
            rating:5.5,
            text:"GharBata made finding a reliable plumber so easy! The professional was prompt,friendly, and fixed the issue properly.Highly recommend!"

        },
        {
            id:2,
            name:"David Lama",
            rating:5,
            text:"I needed a last-minute house cleaning, and GharBata delivered beyond expectations.The service was top-notch, and my home sparkles!"

        },
        {
            id: 3,
            name:"Harry Kc",
            rating:4,
            text:"Booking my dog sitter through GharBata was seamless. It gave me such peace of mind knowing my furry friend was in good hands."

    },
    {
        id:4,
        name:"July Magar",
        rating:5.5,
         text: "The electrician was incredibly knowledgeable and efficient. Resolved my wiring problem quickly and professionally. Great experience overall."     

    },
    {
        id:5,
        name:"Swopnil Thapa",
        rating:4.5,
        text: "Our garden has never looked better! The landscaper from HomeHarmony transformed our backyard into a beautiful sanctuary. Fantastic service!"


    }
];
const renderStars=(rating)=>{
    return Array.from({length:5},(_,index)=>(
        <span 
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400':"text-gray-300" }`}
        >★</span>

    ));
};

        
    
  return (
    <div className='bg-gray-50 py-16 px-4'>
        <div className='max-w-6xl mx-auto'>
            {/*Header*/}
            <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-4'>What Our Clients Say</h2>
                <p className='text-gray-600 max-w-2xl mx-auto'> Hear directly from satisfied homeowners who experienced the GharBata difference.</p>
            </div>
            {/* Testimonials Grid - Responsive: 1 col (mobile), 2 cols (tablet), 3 cols (desktop) */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {testimonials.map((testimonial)=>(
                    <div key={testimonial.id}
                    className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>

                         {/* Stars */}
                         <div className='flex mb-4'>
                            {renderStars(testimonial.rating)}
                         </div>
                         {/* Testimonial text */}
                         <p className='text-gray-700 text-sm leading-relaxed mb-6 italic'>
                            "{testimonial.text}"
                            </p>
                          {/* User info */}
                          <div className='flex items-center'>
                            <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3'>
                                <span className='text-gray-600 font-medium text-sm'>
                                 👤
                                </span>
                            </div>
                            <span className='text-gray-900 font-medium text-sm'>
                                {testimonial.name}
                            </span>
                          </div>
                         </div>

                ))}
            </div>
        </div>
    </div>
   
  );
};

export default WhatClientsay;