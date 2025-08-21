export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || 'ai';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '6';
  const language = searchParams.get('language') || 'id'; 

  try {
    const apiKey = '5fc6507f9a93493190e1b2af68c48f3a';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`NewsAPI request failed: ${response.status} - ${errorData.message}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      articles: data.articles,
      totalResults: data.totalResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
