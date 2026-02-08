import type { ReactNode } from "react";

export default function ComingSoon({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-h-[120px]">
      {/* Grayed out children content */}
      {children && (
        <div
          className="opacity-30 grayscale pointer-events-none select-none"
          aria-hidden="true"
        >
          {children}
        </div>
      )}

      {/* Overlay with coming soon message */}
      <section
        className={`${children ? "absolute inset-0 z-10" : ""} flex flex-col items-center justify-center text-center gap-4 min-h-[120px]`}
        aria-label="Coming soon message"
      >
        <p className="text-sm text-muted-foreground">
          This section is currently a work in progress. Check back soon!
        </p>
        <svg
          className="shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 512 512"
        >
          <title>construction</title>
          <path
            fill="#cbcbcb"
            fillRule="evenodd"
            d="M 32 272 L 32 463 L 111 463 L 112 399 L 207 399 L 208 463 L 287 463 L 287 328 L 159 328 L 127 272 Z M 175 356 L 180 351 L 251 351 L 256 356 L 256 363 L 251 368 L 180 368 L 175 363 Z M 63 356 L 68 351 L 139 351 L 144 356 L 144 363 L 139 368 L 68 368 L 63 363 Z M 63 316 L 68 311 L 107 311 L 112 316 L 112 323 L 107 328 L 68 328 L 63 323 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 431 140 L 424 144 L 402 144 L 377 166 L 375 165 L 375 144 L 360 144 L 360 431 L 380 431 L 414 401 L 416 402 L 416 431 L 431 431 Z M 376 359 L 380 361 L 383 364 L 387 366 L 390 369 L 394 371 L 397 374 L 401 376 L 411 384 L 405 390 L 404 390 L 377 414 L 375 413 L 375 360 Z M 414 319 L 416 320 L 416 367 L 415 368 L 414 368 L 411 365 L 407 363 L 404 360 L 400 358 L 397 355 L 393 353 L 390 350 L 389 350 L 381 344 L 382 342 L 383 342 L 386 339 L 387 339 L 393 334 L 397 332 L 400 329 L 404 327 Z M 376 279 L 380 281 L 383 284 L 387 286 L 390 289 L 394 291 L 397 294 L 401 296 L 404 299 L 405 299 L 410 303 L 409 305 L 408 305 L 405 308 L 401 310 L 398 313 L 397 313 L 394 316 L 390 318 L 387 321 L 383 323 L 377 328 L 375 327 L 375 280 Z M 414 239 L 416 240 L 416 287 L 415 288 L 414 288 L 411 285 L 407 283 L 404 280 L 400 278 L 397 275 L 393 273 L 390 270 L 389 270 L 381 264 L 382 262 L 383 262 L 386 259 L 387 259 L 393 254 L 397 252 L 400 249 L 404 247 Z M 376 199 L 380 201 L 383 204 L 387 206 L 390 209 L 394 211 L 397 214 L 401 216 L 404 219 L 405 219 L 410 223 L 409 225 L 408 225 L 405 228 L 401 230 L 398 233 L 397 233 L 394 236 L 390 238 L 387 241 L 383 243 L 377 248 L 375 247 L 375 200 Z M 414 153 L 416 154 L 416 207 L 415 208 L 414 208 L 404 200 L 397 196 L 394 193 L 390 191 L 380 183 L 386 177 L 387 177 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 374 24 L 102 80 L 58 130 L 56 137 L 62 143 L 239 143 L 240 177 L 255 177 L 256 143 L 343 143 L 343 128 L 320 127 L 343 100 L 346 80 L 183 79 L 366 41 Z M 240 127 L 263 100 L 264 100 L 268 104 L 268 105 L 273 110 L 273 111 L 287 127 L 286 128 L 241 128 Z M 160 127 L 183 100 L 184 100 L 188 104 L 188 105 L 193 110 L 193 111 L 207 127 L 206 128 L 161 128 Z M 80 127 L 103 100 L 104 100 L 108 104 L 108 105 L 113 110 L 113 111 L 127 127 L 126 128 L 81 128 Z M 280 96 L 281 95 L 326 95 L 327 96 L 304 123 L 303 123 L 299 119 L 299 118 L 294 113 L 294 112 Z M 200 96 L 201 95 L 246 95 L 247 96 L 224 123 L 223 123 L 219 119 L 219 118 L 214 113 L 214 112 Z M 120 96 L 121 95 L 166 95 L 167 96 L 144 123 L 143 123 L 139 119 L 139 118 L 134 113 L 134 112 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 8 464 L 8 503 L 503 503 L 503 464 Z"
          />
          <path
            fill="#999999"
            fillRule="evenodd"
            d="M 112 400 L 112 463 L 207 463 L 207 400 Z"
          />
          <path
            fill="#f6a439"
            fillRule="evenodd"
            d="M 344 88 L 344 143 L 423 143 L 423 88 Z"
          />
          <path
            fill="#bcd6da"
            fillRule="evenodd"
            d="M 376 24 L 368 41 L 366 43 L 348 79 L 348 81 L 345 87 L 423 87 L 423 24 Z"
          />
          <path
            fill="#999999"
            fillRule="evenodd"
            d="M 184 256 L 184 287 L 311 287 L 311 256 Z"
          />
          <path
            fill="#999999"
            fillRule="evenodd"
            d="M 128 184 L 128 273 L 130 275 L 132 280 L 134 282 L 136 287 L 138 289 L 140 294 L 142 296 L 159 327 L 159 184 Z"
          />
          <path
            fill="#f6a439"
            fillRule="evenodd"
            d="M 336 432 L 336 463 L 447 463 L 447 432 Z"
          />
          <path
            fill="#999999"
            fillRule="evenodd"
            d="M 424 143 L 465 122 L 468 122 L 469 121 L 471 121 L 475 119 L 478 119 L 479 118 L 481 118 L 485 116 L 488 116 L 489 115 L 491 115 L 492 114 L 498 113 L 499 112 L 503 111 L 503 88 L 424 88 Z"
          />
          <path
            fill="#999999"
            fillRule="evenodd"
            d="M 56 184 L 56 271 L 87 271 L 87 184 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 184 254 L 184 255 L 204 255 L 245 219 L 248 218 L 291 255 L 311 255 L 310 252 L 302 244 L 257 206 L 255 206 L 252 208 L 243 208 L 240 206 L 238 206 L 193 244 Z"
          />
          <path
            fill="#f6a439"
            fillRule="evenodd"
            d="M 503 113 L 497 114 L 496 115 L 494 115 L 490 117 L 487 117 L 486 118 L 484 118 L 480 120 L 477 120 L 476 121 L 474 121 L 470 123 L 464 124 L 464 167 L 503 167 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 424 24 L 424 41 L 427 44 L 428 44 L 431 47 L 432 47 L 436 51 L 437 51 L 440 54 L 441 54 L 445 58 L 446 58 L 449 61 L 450 61 L 454 65 L 455 65 L 458 68 L 459 68 L 463 72 L 464 72 L 467 75 L 468 75 L 481 86 L 483 87 L 503 87 L 502 86 L 502 84 L 496 78 L 495 78 L 492 75 L 491 75 L 487 71 L 486 71 L 483 68 L 482 68 L 478 64 L 477 64 L 474 61 L 473 61 L 469 57 L 468 57 L 465 54 L 464 54 L 460 50 L 459 50 L 456 47 L 455 47 L 451 43 L 450 43 L 447 40 L 446 40 L 433 29 L 432 29 L 429 26 L 425 25 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 176 358 L 176 361 L 177 363 L 182 367 L 249 367 L 251 366 L 255 361 L 255 358 L 254 356 L 249 352 L 182 352 L 180 353 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 64 358 L 64 361 L 65 363 L 70 367 L 137 367 L 139 366 L 143 361 L 143 358 L 142 356 L 137 352 L 70 352 L 68 353 Z"
          />
          <path
            fill="#f6a439"
            fillRule="evenodd"
            d="M 246 176 L 245 177 L 242 177 L 238 179 L 235 182 L 233 186 L 232 193 L 233 194 L 233 197 L 237 203 L 238 203 L 242 206 L 249 207 L 250 206 L 253 206 L 259 202 L 259 201 L 262 197 L 263 190 L 262 189 L 262 186 L 258 180 L 257 180 L 253 177 Z"
          />
          <path
            fill="#666666"
            fillRule="evenodd"
            d="M 64 318 L 64 321 L 65 323 L 70 327 L 105 327 L 107 326 L 111 321 L 111 318 L 110 316 L 105 312 L 70 312 L 68 313 Z"
          />
          <path
            fill="#000000"
            fillRule="evenodd"
            d="M 256 178 L 258 179 L 263 186 L 263 189 L 263 186 L 261 182 L 257 178 Z"
          />
        </svg>
      </section>
    </div>
  );
}
