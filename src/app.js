PDFJS.workerSrc = 'https://unpkg.com/pdfjs-dist@2.0.250/build/pdf.worker.min.js'

const id = async () => {
  const matches = window.location.pathname.match(/^\/(\d+)/)
  if (!matches) throw new Error('No ID')
  return matches[1]
}

const resource = url => window.fetch(url).then(res => res.json())

const largestFirst = (a, b) => b.size - a.size

const isPdf = item => item['mimetype'] === 'application/pdf'

// const addAlternateLink = url => {
//   const link = document.createElement('link')
//   link.setAttribute('rel', 'alternate')
//   link.setAttribute('type', 'application/pdf')
//   link.setAttribute('href', url)
//   document.head.appendChild(link)
// }

// const addMetaLink = url => {
//   const meta = document.createElement('meta')
//   meta.setAttribute('name', 'citation_pdf_url')
//   meta.setAttribute('content', url)
//   document.head.appendChild(meta)
// }

const addCanonicalLink = url => {
  const link = document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', url.replace(/^https:\/\/doi\.org\//, 'doi:'))
  document.head.appendChild(link)
}

const zenodo = async id => {
  const record = await resource(`https://zenodo.org/api/records/${id}`)

  // addCanonicalLink(record.links.doi)

  const bucket = await resource(record.links.bucket)
  const pdf = bucket.contents.sort(largestFirst).find(isPdf).links.self

  addCanonicalLink(pdf)
  // addMetaLink(pdf)
  // addAlternateLink(pdf)

  return pdf
}

const pdf = async url => {
  const container = document.getElementById('viewerContainer')

  const pdfViewer = new PDFJS.PDFViewer({
    container,
    removePageBorders: true,
    enhanceTextSelection: true,
  })

  container.addEventListener('pagesinit', function () {
    pdfViewer.currentScaleValue = 'page-width'
  })

  const pdfDocument = await PDFJS.getDocument(url)

  pdfViewer.setDocument(pdfDocument)
}

const hypothesis = () => {
  window.hypothesisConfig = () => ({
    // 'openSidebar': true,
  })

  const script = document.createElement('script')
  script.setAttribute('src', 'https://hypothes.is/embed.js')
  document.body.appendChild(script)
}

id().then(zenodo).then(pdf).then(hypothesis)
