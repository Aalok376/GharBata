import React from 'react'

const WhyChoose = () => {
    const features=[
        {
            icon:'✅',
            title:'Trusted Professionals',
            desc:'All our service providers are background checked and verified.'

        },
        {
            icon:'🕒',
            title:'On-Time Service',
            desc:"We value your time, so we ensure prompt and timely services."

        },
        {
        icon : '💬',
        title:'24/7 Support',
        desc:'Have questions? Our support team is here for you anytime.'

        },
    ]
  return (
   <section className='w-full py-24 bg-gradient-to-br from-indigo-50 to-purple-100 ' id="why-choose">
    <div className='max-w-6xl mx-auto px-4 text-center '>
        <div className='flex flex-col items-center space-y-8'>
            <h2 className='text-4xl font-bold  text-gray-800'>Why Choose GharBata?</h2>
        <p className='text-gray-600 text-lg max-w-2xl mt-8'>
            Experience convenience,reliability, and care with every service.
            </p>
        </div>
        <div className='grid md:grid-cols-3 gap-12 mt-10 '> 
            {features.map((f,index)=>(
               <div key={index}
                className='bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 ease-in-out' >

                <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl'>
                    {f.icon}
                    </div>
                <h4 className='text-xl font-semibold mb-4 text-gray-800'>
                    {f.title}
                    </h4>
                <p className='text-gray-600'>{f.desc}</p>
               </div>
            )
            )}

        </div>
    </div>
   </section>
  )
}

export default WhyChoose;