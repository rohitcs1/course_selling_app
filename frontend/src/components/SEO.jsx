import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SEO = ({ 
  title, 
  description, 
  image = 'https://your-domain.vercel.app/banner.jpg',
  schema
}) => {
  const location = useLocation()
  const url = `https://your-domain.vercel.app${location.pathname}`
  
  useEffect(() => {
    // Update meta tags
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    
    // Update Open Graph tags
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image)
    
    // Update Twitter tags
    document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="twitter:url"]')?.setAttribute('content', url)
    document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', image)

    // Update canonical
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)

    // Add schema if provided
    if (schema) {
      let scriptTag = document.querySelector('#dynamic-schema')
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'dynamic-schema'
        scriptTag.type = 'application/ld+json'
        document.head.appendChild(scriptTag)
      }
      scriptTag.innerHTML = JSON.stringify(schema)
    }
  }, [title, description, image, url, schema])

  return null
}