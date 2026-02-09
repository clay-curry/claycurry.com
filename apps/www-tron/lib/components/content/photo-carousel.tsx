"use client"

import { useState, useCallback, useEffect } from "react"
import Image, { type StaticImageData } from "next/image"
import type { UseEmblaCarouselType } from "embla-carousel-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/lib/components/ui/carousel"

type CarouselApi = UseEmblaCarouselType[1]

type PhotoCarouselProps = {
  images: { src: StaticImageData; alt?: string }[]
  className?: string
}

export function PhotoCarousel({ images, className }: PhotoCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setActiveIndex(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on("select", onSelect)
    return () => { api.off("select", onSelect) }
  }, [api, onSelect])

  return (
    <div className={`my-6 border overflow-hidden px-4 ${className ?? ""}`}>
      <Carousel opts={{ align: "center", loop: true }} setApi={setApi}>
        <CarouselContent className="-ml-10">
          {images.map((img, i) => (
            <CarouselItem
              key={i}
              className="basis-auto pl-10"
            >
              <div className={`relative h-[420px] md:h-[520px] transition-opacity duration-300 ${i === activeIndex ? "opacity-100" : "opacity-40"}`}>
                <Image
                  src={img.src}
                  alt={img.alt ?? ""}
                  placeholder="blur"
                  className="h-full w-auto object-cover"
                  sizes="(max-width: 768px) 80vw, 50vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-background text-foreground border-border shadow-md backdrop-blur-sm" />
        <CarouselNext className="right-2 bg-background text-foreground border-border shadow-md backdrop-blur-sm" />
      </Carousel>
    </div>
  )
}
