import Image, { type StaticImageData } from "next/image"

type PhotoRowProps = {
  images: { src: StaticImageData; alt?: string }[]
}

export function PhotoRow({ images }: PhotoRowProps) {
  const sizes = `(max-width: 768px) 100vw, ${Math.round(100 / images.length)}vw`

  return (
    <div className="my-6 flex gap-2">
      {images.map((img, i) => (
        <div key={i} className="flex-1 min-w-0">
          <Image
            src={img.src}
            alt={img.alt ?? ""}
            placeholder="blur"
            className="w-full h-auto rounded-lg"
            sizes={sizes}
          />
        </div>
      ))}
    </div>
  )
}
