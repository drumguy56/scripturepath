import * as React from "react"
import { cn } from "../../lib/utils"

const FALLBACK_IMAGE_URL = "/media/placeholder.png"

/**
 * Plain <img> for local /media assets. `fittingType="fit"` letterboxes
 * (object-contain); the default crops to fill (object-cover). If the image
 * fails to load, it swaps once to the generic placeholder.
 */
const Image = React.forwardRef(
  ({ src, alt, fittingType = "fill", className, onError, ...props }, ref) => {
    const [failed, setFailed] = React.useState(false)
    React.useEffect(() => setFailed(false), [src])

    const handleError = (event) => {
      if (failed) return
      setFailed(true)
      onError?.(event)
    }

    return (
      <img
        ref={ref}
        src={!src || failed ? FALLBACK_IMAGE_URL : src}
        alt={alt}
        className={cn(fittingType === "fit" ? "object-contain" : "object-cover", className)}
        onError={handleError}
        data-empty-image={!src || undefined}
        data-error-image={failed || undefined}
        {...props}
      />
    )
  }
)
Image.displayName = "Image"

export { Image }
