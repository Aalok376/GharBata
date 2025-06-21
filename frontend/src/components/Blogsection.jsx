import React from 'react';

const Blogsection = () => {
    const blogPosts=[
        {
            id:1,
            title:"5 Tips for a Sparkling Clean Home",
            excerpt:"Discover expert cleaning hacks that will make your home shine with minimal effort...",
            date:"August 9,2025",
            image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&h=200&fit=crop"
        },
        {
            id:2,
            title:"Choosing the Right Plumber for Your Home",
            excerpt: "Learn what to look for when hiring a plumber to ensure quality service and peace of mind...",
            date:'August 3,2025',
            image:"https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=280&h=200&fit=crop"
        },
        {
            id:3,
            title: "Seasonal Garden Maintenance Checklist",
            excerpt:"Keep your garden thriving year-round with our comprehensive seasonal guide...",
            date:"July 6,2025",
            image:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=280&h=200&fit=crop"
        },
        {
          id:4,
          title: "Benefits of Professional Pet Sitting Services",
          excerpt:"Understand why professional pet sitting is the best choice for your beloved companions...",
          date:"September 23,2025" ,
          image:"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=280&h=200&fit=crop"
          
        }
    ];
  return (
    <section className='py-16 px-4 bg-gray-50'>
        <div className='max-w-7xl mx-auto'>
            {/* Section Header */}
            <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Latest From Our Blog</h2>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                        Stay informed with tips, guides, and insights for maintaining a harmonious home.

                </p>
  </div>
      {/* Blog Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {blogPosts.map((post)=>(
            <article
            key={post.id}
            className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group cursor-pointer'>
                 {/* Image */}
                 <div className='relative overflow-hidden'>
                    <img src={post.image}
                    alt={post.title}
                    className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300'
                    loading='lazy'
               />
               </div>
                 {/* Content */}
                 <div className='p-6'>
                    <h3 className='text-lg font-semibold text-shadow-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200'>{post.title}</h3>
                    <p className='text-gray-600 text-sm mb-4 leading-relaxed'>{post.excerpt}</p>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                       <span>{post.date}</span> 
                    </div>
                 </div>

            </article>
        ))}
      </div>

            
        </div>

    </section>
    
  )
}

export default Blogsection;