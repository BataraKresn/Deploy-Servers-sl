import { type NextRequest, NextResponse } from "next/server"

// Dua kandidat URL backend : host-port & service Docker
const CANDIDATE_BACKENDS = [
  process.env.BACKEND_API_URL, // ← hormati env bila disetel
  "http://localhost:5001", // host port (docker-compose expose 5001:5000)
  "http://backend:5000", // service name di jaringan docker-compose
].filter(Boolean) as string[]

async function handler(req: NextRequest) {
  // Reconstruct the backend URL
  const path = req.nextUrl.pathname
  const search = req.nextUrl.search

  let lastError: unknown
  for (const base of CANDIDATE_BACKENDS) {
    try {
      const apiUrl = `${base}${path}${search}`
      const apiRes = await fetch(apiUrl, {
        method: req.method,
        headers: {
          // teruskan semua header kecuali host
          ...Object.fromEntries(req.headers.entries()),
          host: undefined as unknown as string,
        },
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
        duplex: "half",
      })

      /* -----  bagian handling response tetap sama  ----- */
      if (path.includes("/api/stream-log")) {
        return new NextResponse(apiRes.body, {
          status: apiRes.status,
          statusText: apiRes.statusText,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Encoding": "none",
          },
        })
      }

      const contentType = apiRes.headers.get("content-type") || ""
      if (contentType.includes("text/plain")) {
        const text = await apiRes.text()
        return new Response(text, {
          status: apiRes.status,
          headers: { "Content-Type": "text/plain" },
        })
      }

      const data = await apiRes.json()
      return NextResponse.json(data, { status: apiRes.status })
    } catch (err) {
      lastError = err // simpan error & coba backend berikutnya
    }
  }

  /* Semua kandidat gagal */
  console.error("API Proxy Error:", lastError)
  return NextResponse.json({ message: "API Proxy Error", detail: String(lastError) }, { status: 502 })
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
