import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { ScrollArea } from './components/ui/scroll-area'
import { Search, TrendingUp, ShoppingCart, Star, ExternalLink, Euro, Truck, Clock, Bot, User, Send, Loader2, MessageCircle } from 'lucide-react'
import { blink } from './blink/client'

interface Product {
  id: string
  name: string
  image: string
  category: string
  prices: {
    store: string
    price: number
    originalPrice?: number
    shipping: number
    logo: string
    url: string
    inStock: boolean
  }[]
  rating: number
  reviews: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Visi')
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Sveiki! Aš esu jūsų asmeninis pirkimo konsultantas. Papasakokite, ko ieškote, ir aš padėsiu rasti geriausius pasiūlymus Lietuvos e-parduotuvėse. Galiu palyginti kainas, patarti dėl produktų ir padėti sutaupyti pinigų!',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample data for demonstration
  const categories = ['Visi', 'Elektronika', 'Namų prekės', 'Įrankiai', 'Sportas', 'Grožis']
  
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro 128GB',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      category: 'Elektronika',
      rating: 4.8,
      reviews: 1247,
      prices: [
        {
          store: 'Pigu.lt',
          price: 1299,
          originalPrice: 1399,
          shipping: 0,
          logo: '🛒',
          url: 'https://pigu.lt/lt/mobilieji-telefonai/apple-iphone-15-pro-128gb',
          inStock: true
        },
        {
          store: 'Varle.lt',
          price: 1349,
          shipping: 5,
          logo: '🏪',
          url: 'https://varle.lt/mobilieji-telefonai/apple-iphone-15-pro-128gb.html',
          inStock: true
        },
        {
          store: '220.lv',
          price: 1289,
          shipping: 15,
          logo: '🛍️',
          url: 'https://220.lv/lv/mobilais-telefons/apple-iphone-15-pro-128gb',
          inStock: false
        }
      ]
    },
    {
      id: '2',
      name: 'Samsung 55" QLED TV',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop',
      category: 'Elektronika',
      rating: 4.6,
      reviews: 892,
      prices: [
        {
          store: 'Senukai.lt',
          price: 899,
          originalPrice: 999,
          shipping: 29,
          logo: '🏠',
          url: 'https://www.senukai.lt/elektronika/televizoriai/samsung-55-qled-tv',
          inStock: true
        },
        {
          store: 'Pigu.lt',
          price: 949,
          shipping: 0,
          logo: '🛒',
          url: 'https://pigu.lt/lt/televizoriai/samsung-55-qled-smart-tv',
          inStock: true
        }
      ]
    },
    {
      id: '3',
      name: 'Bosch gręžtuvas PSR 1440',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop',
      category: 'Įrankiai',
      rating: 4.7,
      reviews: 456,
      prices: [
        {
          store: 'Senukai.lt',
          price: 89,
          shipping: 5,
          logo: '🏠',
          url: 'https://www.senukai.lt/irankiai/elektriniai-irankiai/greztuvas-bosch-psr-1440',
          inStock: true
        },
        {
          store: 'Varle.lt',
          price: 95,
          shipping: 7,
          logo: '🏪',
          url: 'https://varle.lt/irankiai/elektriniai-irankiai/bosch-greztuvas-psr-1440.html',
          inStock: true
        }
      ]
    }
  ]

  const topDeals = [
    { store: 'Pigu.lt', discount: '30%', product: 'Laptopai', expires: '2 val.', url: 'https://pigu.lt/lt/kompiuteriai/nesiojami-kompiuteriai' },
    { store: 'Senukai.lt', discount: '25%', product: 'Sodo technika', expires: '1 d.', url: 'https://www.senukai.lt/sodo-technika' },
    { store: 'Varle.lt', discount: '40%', product: 'Telefonai', expires: '5 val.', url: 'https://varle.lt/mobilieji-telefonai' },
    { store: '220.lv', discount: '35%', product: 'Buitinė technika', expires: '3 val.', url: 'https://220.lv/lv/majsaimniecibas-preces' },
    { store: 'Euronics.lt', discount: '20%', product: 'Elektronika', expires: '6 val.', url: 'https://www.euronics.lt' },
    { store: 'Topo Centras', discount: '15%', product: 'Sporto prekės', expires: '4 val.', url: 'https://www.topocentras.lt' }
  ]

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let streamingContent = ''
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      await blink.ai.streamText(
        {
          messages: [
            {
              role: 'system',
              content: `You are a helpful shopping consultant for Lithuanian e-commerce. You help users find the best deals, compare prices, and make informed purchasing decisions across Lithuanian online stores like Pigu.lt, Senukai.lt, Varle.lt, 220.lv, and others.

Key responsibilities:
- Help users find products and compare prices
- Provide shopping advice and recommendations
- Explain product features and specifications
- Suggest alternatives and better deals
- Help with product categories (electronics, home goods, tools, etc.)
- Provide information about shipping costs and delivery times
- Answer questions about Lithuanian e-commerce market
- Ask follow-up questions to better understand user needs
- Be conversational and consultative, like a personal shopping assistant

Always respond in Lithuanian language. Be friendly, helpful, and knowledgeable about Lithuanian shopping culture and preferences. Focus on practical advice that saves money and time. Ask clarifying questions to provide better recommendations.`
            },
            ...messages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ],
          model: 'gpt-4o-mini',
          maxTokens: 500
        },
        (chunk) => {
          streamingContent += chunk
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: streamingContent }
                : msg
            )
          )
        }
      )
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Atsiprašau, įvyko klaida. Bandykite dar kartą.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev.slice(0, -1), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search functionality would be implemented here
    console.log('Searching for:', searchQuery)
  }

  const getLowestPrice = (prices: Product['prices']) => {
    return Math.min(...prices.filter(p => p.inStock).map(p => p.price + p.shipping))
  }

  const getSavings = (prices: Product['prices']) => {
    const inStockPrices = prices.filter(p => p.inStock).map(p => p.price + p.shipping)
    if (inStockPrices.length < 2) return 0
    return Math.max(...inStockPrices) - Math.min(...inStockPrices)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Kraunama...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Kainų palyginimas</CardTitle>
            <p className="text-muted-foreground">Prisijunkite, kad galėtumėte naudotis platforma</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
            >
              Prisijungti
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Euro className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-primary">KainuLT</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Sveiki, {user.email}</span>
              <Button variant="outline" size="sm" onClick={() => blink.auth.logout()}>
                Atsijungti
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Shopping Consultant Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              AI Pirkimo Konsultantas
            </h2>
            <p className="text-lg text-muted-foreground">
              Papasakokite, ko ieškote, ir aš padėsiu rasti geriausius pasiūlymus
            </p>
          </div>
          
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Jūsų asmeninis pirkimo asistentas</CardTitle>
                  <p className="text-sm text-muted-foreground">Palygina kainas ir konsultuoja apie pirkimus</p>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-[80%] ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-accent text-accent-foreground ml-auto'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString('lt-LT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Galvoju...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="p-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Populiarūs klausimai:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Kur rasti pigiausią iPhone?',
                      'Palygink skalbimo mašinų kainas',
                      'Kokie geriausi televizoriai iki 500€?',
                      'Kur pirkti statybos įrankius?',
                      'Ieškau nešiojamo kompiuterio studijoms',
                      'Reikia virtuvės prietaisų'
                    ].map((question, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setInput(question)}
                      >
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Papasakokite, ko ieškote..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Deals */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Geriausi pasiūlymai</h3>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDeals.map((deal, index) => (
              <Card 
                key={index} 
                className="border-l-4 border-l-accent hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.open(deal.url, '_blank')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{deal.store}</span>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      -{deal.discount}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{deal.product}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      Baigiasi po {deal.expires}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-foreground mb-8">Populiarūs produktai</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.reviews} atsiliepimai)
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {product.prices.map((price, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{price.logo}</span>
                          <div>
                            <p className="font-medium">{price.store}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Truck className="w-3 h-3 mr-1" />
                              {price.shipping === 0 ? 'Nemokamas pristatymas' : `+${price.shipping}€ pristatymas`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary">
                              {price.price}€
                            </span>
                            {price.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {price.originalPrice}€
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end space-x-2 mt-1">
                            {!price.inStock && (
                              <Badge variant="secondary" className="text-xs">
                                Nėra sandėlyje
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={!price.inStock}
                              onClick={() => window.open(price.url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Pirkti
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Žemiausia kaina</p>
                      <p className="text-xl font-bold text-primary">
                        {getLowestPrice(product.prices)}€
                      </p>
                    </div>
                    {getSavings(product.prices) > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Sutaupysite</p>
                        <p className="text-lg font-bold text-accent">
                          {getSavings(product.prices)}€
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Euro className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-primary">KainuLT</h3>
              </div>
              <p className="text-muted-foreground">
                Lietuvos kainų palyginimo platforma, padedanti rasti geriausius pasiūlymus.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Parduotuvės</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="https://pigu.lt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Pigu.lt
                  </a>
                </li>
                <li>
                  <a href="https://www.senukai.lt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Senukai.lt
                  </a>
                </li>
                <li>
                  <a href="https://varle.lt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Varle.lt
                  </a>
                </li>
                <li>
                  <a href="https://220.lv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    220.lv
                  </a>
                </li>
                <li>
                  <a href="https://www.euronics.lt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Euronics.lt
                  </a>
                </li>
                <li>
                  <a href="https://www.topocentras.lt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    Topo Centras
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kategorijos</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Elektronika</li>
                <li>Namų prekės</li>
                <li>Įrankiai</li>
                <li>Sportas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Pagalba</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Kaip naudotis</li>
                <li>Kontaktai</li>
                <li>DUK</li>
                <li>Privatumo politika</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 KainuLT. Visos teisės saugomos.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App