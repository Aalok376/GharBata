import React from 'react'

    const providers=[
        {
            name:"ProClean Solutions",
            role:"House Cleanings",
            price:'from $85/hr',
            rating: 4.5,
            image:"https://www.nicepng.com/png/full/224-2243835_cleaning-logo-png-cleaning-services-logo-png.png",
            
        },
        {
            name:"Swift Plumbing",
            role:"Emergency Plumbing",
            price:"From $120/hr",
            rating:3.5,
            image:"https://www.bing.com/th/id/OIP.RrsRoAg49Nti060V0LoOaQHaE6?w=268&h=200&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",
        },
        {
            name:"Garden Guru",
            role:"Gardening and Lawn Care",
           price:"From $70/hr",
           rating:5,
           image:"https://th.bing.com/th/id/OIP.Sbr0TgxQqQESdACot3B0KQHaHa?w=250&h=250&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",

        },
        {
            name:'Electrician',
            role:"Electrical Services",
            price:"From $110/hr",
            rating: 4,
            image:"https://www.bing.com/th/id/OIP.8yOKPGXHZ-wHOWwOi66yLgHaHa?w=229&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2",

        }
    ];
    //star icons:full,half,empty
    const StarFull=()=>(
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.538 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.783.57-1.838-.196-1.538-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
  </svg>
    );
    const StarHalf=()=>(
        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill="currentColor">
            <defs>
                <linearGradient id="half-grad">
                    <stop offset="50%" stopColor="currentColor"/>
                    <stop offset="50%" stopColor='transparent' stopOpacity='1'/>
                </linearGradient>
            </defs>
            <path
      fill="url(#half-grad)"
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.538 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.783.57-1.838-.196-1.538-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
        </svg>
    );
    const StarEmpty=()=>(
        <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-gray-300' fill="none" viewBox='0 0 20 20' stroke='currentColor' strokeWidth={1.5}>
            <path
            strokeLinecap='round'
            strokeLinejoin='round'
             d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.538 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.783.57-1.838-.196-1.538-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"
    />
        </svg>

    );
    const renderStars=(rating)=>{
        const stars=[];
        for(let i=1;i<=5;i++){
            if(rating >=i){
                stars.push(<StarFull key={i} />);
            }else if(rating + 0.5 >=i){
                stars.push(<StarHalf key={i} />);
            }else{
                stars.push(<StarEmpty key={i} />);
            }
        }
        return stars;
    };
    
    const TopRatedProviders=()=>{
  return (
 <section className="bg-gray-100 py-16 px-8 w-full text-center">
 <div className="max-w-screen-2xl mx-auto">
        <h2 className='text-2xl font-bold mb-12'>Meet Our Top-Rated Providers</h2>
        <p className='text-gray-600 mb-10'>
            Discover experienced and highly-rated professionals ready to serve your home.
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
            {providers.map((provider,index)=>(
                <div key={index} 
                className=' group bg-white  rounded border-2 border-transparent shadow-sm transition duration-300 ease-in-out transform  hover:scale-105 hover:shadow-lg hover:bg-gray-300 hover:border-gray-800 cursor-pointer'>
                    <div className='h-40 bg-gray-200 rounded-t overflow-hidden'>
                    <img 
                    src={provider.image} 
                    alt={provider.name}
                    className='h-40 w-full object-cover rounded-t transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90'
                     />
                     </div>
                    <div className="my-3 border-t-2 border-violet-600 w-16 mx-auto"></div>

                     <div className='p-4'>
                        <h3 className='font-semibold'>{provider.name}</h3>
                        <p className='text-sm text-gray-500'>{provider.role}</p>
                        <div className='flex justify-center my-2 space-x-1 text-yellow-400'>
                            {renderStars(provider.rating)}
                            </div>
                        <p className='font-semibold text-sm text-black mb-3'>{provider.price}</p>
                        <button className='text-sm px-4 py-1 border border-gray-900 rounded hover:bg-gray-500 transition'>
                            View Profile
                        </button>
                     </div>
                </div>
            ))}
        </div>
    </div>
 </section>
  );
};

export default TopRatedProviders;