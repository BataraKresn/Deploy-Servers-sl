import { type NextRequest, NextResponse } from "next/server"

// URL backend diambil dari .env (NEXT_PUBLIC_BACKEND_API_URL)
// Use process.env only if using Node.js runtime, otherwise use globalThis for edge runtime
const BACKEND_API_URL =
  process.env?.NEXT_PUBLIC_BACKEND_API_URL ??
  (globalThis as any).NEXT_PUBLIC_BACKEND_API_URL ??
  "";

async function handler(req: NextRequest) {
  // Reconstruct the backend URL
  const path = req.nextUrl.pathname
  const search = req.nextUrl.search

<<<<<<< HEAD
  try {
    const apiUrl = `${BACKEND_API_URL}${path}${search}`
    // Untuk streaming log, tambahkan duplex: 'half' (type cast agar tidak error TS)
    const fetchOptions: RequestInit | any = {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        host: undefined as unknown as string,
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
=======
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
      if (contentType.startsWith("text/")) {
        const text = await apiRes.text()
        return new Response(text, {
          status: apiRes.status,
          headers: { "Content-Type": contentType },
        })
      }

      const data = await apiRes.json()
      return NextResponse.json(data, { status: apiRes.status })
    } catch (err) {
      lastError = err // simpan error & coba backend berikutnya
>>>>>>> af5fe87bd40b7c2d53e8af559dd26a6bf6ff740f
    }
    if (path.includes("/api/stream-log")) {
      fetchOptions.duplex = "half"
    }
    const apiRes = await fetch(apiUrl, fetchOptions)

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
     if (contentType.startsWith("text/")) {
      const text = await apiRes.text()
      return new Response(text, {
        status: apiRes.status,
        headers: { "Content-Type": contentType },
      })
    }

    const data = await apiRes.json()
    return NextResponse.json(data, { status: apiRes.status })
  } catch (err) {
    console.error("API Proxy Error:", err)
    return NextResponse.json({ message: "API Proxy Error", detail: String(err) }, { status: 502 })
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }
