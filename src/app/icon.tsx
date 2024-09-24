import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 645 720" fill="currentColor"
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          borderRadius: '20%', // Updated border radius to 20%
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white', // Updated color to white
        }}
      >
        <path d="M 645 570 Q 645 576 633 592 T 594 630 T 534 672 T 450 706 T 347 720 Q 291 720 237 704 T 135 655 T 52 567 T 5 440 Q 0 418 0 360 T 5 280 Q 27 163 104 90 T 302 2 Q 305 2 325 1 T 356 0 Q 410 3 464 24 T 546 46 Q 564 46 572 39 T 581 23 T 586 7 T 600 -1 Q 611 -1 618 11 V 220 L 614 227 Q 601 234 589 229 Q 585 225 579 205 T 556 160 Q 523 114 468 76 T 351 38 H 342 Q 298 38 260 76 Q 173 154 173 365 Q 173 452 194 522 Q 235 671 366 671 Q 494 671 602 571 Q 619 554 627 554 Q 632 554 638 558 T 645 570 Z M 211 76 Q 225 58 222 58 Q 199 66 175 81 T 122 122 T 71 191 T 40 287 Q 35 317 35 360 T 40 433 Q 50 488 74 532 T 125 600 T 178 640 T 221 662 L 238 667 Q 231 660 225 653 Q 160 590 142 447 Q 139 420 139 357 T 142 267 Q 161 142 211 76 Z M 582 136 V 76 Q 578 78 574 78 Q 564 82 551 82 H 536 L 549 96 Q 569 118 571 122 L 582 136 Z" />
      </svg>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}


