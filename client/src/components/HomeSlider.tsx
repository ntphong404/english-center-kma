import React, { useEffect, useRef, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { BannerCourseResponse } from '@/types/bannercourse';
import { ApiResponse } from '@/types/api';
import { bannerCourseApi } from '@/api/bannerCourseApi';
import Autoplay from 'embla-carousel-autoplay';

const HomeSlider = () => {
  const [slides, setSlides] = useState<BannerCourseResponse[]>([]);
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerCourseApi.getList();
        if (response.data.code === 200) {
          setSlides(response.data.result);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };

    fetchBanners();
  }, []);

  return (
    <Carousel
      className="w-full"
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.bannerCourseId}>
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-opacity-60 text-white">
                <h3 className="text-3xl font-bold mb-2">{slide.title}</h3>
                <p className="text-xl">{slide.description}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4">
        <CarouselPrevious className="relative mr-4 left-0 translate-y-0" />
        <CarouselNext className="relative ml-4 right-0 translate-y-0" />
      </div>
    </Carousel>
  );
};

export default HomeSlider;
