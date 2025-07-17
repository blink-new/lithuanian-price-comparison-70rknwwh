import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Separator } from './components/ui/separator'
import { Search, TrendingUp, ShoppingCart, Star, ExternalLink, Euro, Truck, Clock } from 'lucide-react'
import { ChatButton } from './components/ChatConsultation'
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

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Visi')

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
          url: '#',
          inStock: true
        },
        {
          store: 'Varle.lt',
          price: 1349,
          shipping: 5,
          logo: '🏪',
          url: '#',
          inStock: true
        },
        {
          store: '220.lv',
          price: 1289,
          shipping: 15,
          logo: '🛍️',
          url: '#',
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
          url: '#',
          inStock: true
        },
        {
          store: 'Pigu.lt',
          price: 949,
          shipping: 0,
          logo: '🛒',
          url: '#',
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
          url: '#',
          inStock: true
        },
        {
          store: 'Varle.lt',
          price: 95,
          shipping: 7,
          logo: '🏪',
          url: '#',
          inStock: true
        }
      ]
    }
  ]

  const topDeals = [
    { store: 'Pigu.lt', discount: '30%', product: 'Laptopai', expires: '2 val.' },
    { store: 'Senukai.lt', discount: '25%', product: 'Sodo technika', expires: '1 d.' },
    { store: 'Varle.lt', discount: '40%', product: 'Telefonai', expires: '5 val.' }
  ]

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Raskite geriausius pasiūlymus Lietuvoje
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Palyginkite kainas iš visų pagrindinių e-parduotuvių ir sutaupykite pinigų
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ieškokite produktų..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg"
              />
              <Button type="submit" size="lg" className="px-8">
                <Search className="w-5 h-5 mr-2" />
                Ieškoti
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Top Deals */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Geriausi pasiūlymai</h3>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDeals.map((deal, index) => (
              <Card key={index} className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">{deal.store}</span>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      -{deal.discount}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{deal.product}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    Baigiasi po {deal.expires}
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
                            <Button size="sm" variant="outline" disabled={!price.inStock}>
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
                <li>Pigu.lt</li>
                <li>Senukai.lt</li>
                <li>Varle.lt</li>
                <li>220.lv</li>
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

      {/* Chat Button */}
      <ChatButton />
    </div>
  )
}

export default App