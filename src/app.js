PDFJS.workerSrc = 'https://unpkg.com/pdfjs-dist@2.0.250/build/pdf.worker.min.js'

const id = async () => {
  const matches = window.location.pathname.match(/^\/(\d+)/)
  if (!matches) throw new Error('No ID')
  return matches[1]
}

const resource = url => window.fetch(url).then(res => res.json())

const largestFirst = (a, b) => b.size - a.size

const isPdf = item => item['mimetype'] === 'application/pdf'

const addCanonicalLink = url => {
  const link = document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', url)
  document.head.appendChild(link)
}

const zenodo = async id => {
  const record = await resource(`https://zenodo.org/api/records/${id}`)

  // addCanonicalLink(record.links.doi.replace(/^https:\/\/doi\.org\//, 'doi:'))

  const bucket = await resource(record.links.bucket)

  return bucket.contents.sort(largestFirst).find(isPdf).links.self
}

const pdf = async url => {
  const container = document.getElementById('viewerContainer')

  const pdfViewer = new PDFJS.PDFViewer({
    container,
    removePageBorders: true,
    enhanceTextSelection: true,
  })

  container.addEventListener('pagesinit', () => {
    pdfViewer.currentScaleValue = 'page-width'
  })

  const pdfDocument = await PDFJS.getDocument(url)

  pdfViewer.setDocument(pdfDocument)

  addCanonicalLink('urn:x-pdf:' + pdfDocument.fingerprint)
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
