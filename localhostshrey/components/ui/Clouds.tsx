'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const Clouds = () => {
    return (
        <div className="h-[180dvh] lg:h-[100dvh] p-4 max-w-[1920px] mx-auto w-full items-center justify-center overflow-hidden absolute top-0 inset-0 size-full -z-10 hidden dark:flex" >
            <Image
                src="/elipse.svg"
                alt="elipse"
                width={1080}
                height={1080}
                className="absolute inset-0 size-full object-cover opacity-90 lg:object-fill z-0"
                unoptimized
            />
            <Image
                src="/bigCloud.png"
                alt="elipse"
                width={1080}
                height={1080}
                className="w-full -bottom-0 h-[350px] lg:h-[550px] lg:-bottom-[180px] absolute object-cover lg:object-contain"
                unoptimized
            />
            <Image
                src="/cloudCrop.png"
                alt="crop"
                width={1080}
                height={1080}
                className="w-[60%]  lg:w-[687px] -left-0 top-[20%] lg:top-12 absolute object-contain"
            />
            <Image
                src="/cloud.png"
                alt="elipse"
                width={1080}
                height={1080}
                className="w-[497px] max-sm:-left-20 lg:-right-0 top-[800px]  lg:top-20 absolute object-contain z-50"
                unoptimized
            />
            <Image
                src="/cloud.png"
                alt="elipse"
                width={1080}
                height={1080}
                className="w-[497px]  left-16 top-[150px] z-50 lg:top-0 absolute object-contain"
                unoptimized
            />
            <motion.div className="absolute opacity-100 top-1/2 left-[54%]  -translate-x-1/2 -translate-y-1/2 z-30 w-full max-w-[1000px] h-[110px] lg:h-[700px] dark:bg-white/95" style={{
                borderRadius: '100%',
                mixBlendMode: 'plus-lighter',
                filter: 'blur(180px)',
                position: 'absolute',
            }}></motion.div>
            {/* <motion.div className="absolute opacity-100 top-[0%] right-0  z-0 w-full max-w-[800px] h-[110px] lg:h-[380px] dark:bg-gradient-to-l dark:from-white dark:via-white/90 dark:to-white" style={{
                borderRadius: '100%',
                filter: 'blur(80px)',
                mixBlendMode: 'plus-lighter',
                position: 'absolute',
            }}></motion.div> */}
            {/* <motion.div className="absolute opacity-100 top-[60%] left-[75%]  -translate-x-1/2 z-30 w-full max-w-[900px] h-[110px] lg:h-[400px] dark:bg-gradient-to-l dark:from-transparent dark:via-white/90 dark:to-white" style={{
                borderRadius: '100%',
                mixBlendMode: 'plus-lighter',
                filter: 'blur(80px)',
                position: 'absolute',
            }}></motion.div> */}
        </div>
    )
}

export default Clouds