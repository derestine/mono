'use client'

import { useThemeStore } from '@/stores/theme'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input } from '@/components/ui'
import { Heading, Text, Code, Label, List, Quote, typographyVariants } from '@/components/ui'
import { Moon, Sun, Palette, Code as CodeIcon, Zap, Type, Hash, Quote as QuoteIcon, Store } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-normal">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Heading as="h1" size="4xl" className="typography-display sm:text-5xl">
              Loyalty
            </Heading>
            <Text size="lg" variant="muted" className="typography-body sm:text-xl">
              A comprehensive typography system with monospace consistency
            </Text>
            <div className="flex justify-center gap-4">
              <Link href="/merchant">
                <Button className="flex items-center gap-2 text-base">
                  <Store className="w-4 h-4" />
                  Merchant Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* Theme Controls */}
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="w-5 h-5" />
                Theme Controls
              </CardTitle>
              <CardDescription className="text-base">
                Toggle between light and dark themes to see the typography system in action
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={toggleTheme} className="flex items-center gap-2 text-base">
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      Light Mode
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex items-center gap-2 text-base">
                  <CodeIcon className="w-4 h-4" />
                  Current: {theme}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Active Theme</Badge>
                <Badge variant="secondary">{theme}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Typography Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Headings */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Type className="w-5 h-5" />
                  Headings
                </CardTitle>
                <CardDescription className="text-base">
                  Different heading sizes and weights using monospace font
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <Heading as="h1" size="3xl" className="sm:text-4xl">Heading 1 (4xl)</Heading>
                  <Heading as="h2" size="2xl" className="sm:text-3xl">Heading 2 (3xl)</Heading>
                  <Heading as="h3" size="xl" className="sm:text-2xl">Heading 3 (2xl)</Heading>
                  <Heading as="h4" size="lg" className="sm:text-xl">Heading 4 (xl)</Heading>
                  <Heading as="h5" size="base" className="sm:text-lg">Heading 5 (lg)</Heading>
                  <Heading as="h6" size="sm" className="sm:text-base">Heading 6 (base)</Heading>
                </div>
                <div className="space-y-3">
                  <Heading size="xl" weight="normal" variant="muted" className="sm:text-2xl">Normal Weight</Heading>
                  <Heading size="xl" weight="medium" variant="muted" className="sm:text-2xl">Medium Weight</Heading>
                  <Heading size="xl" weight="semibold" variant="muted" className="sm:text-2xl">Semibold Weight</Heading>
                  <Heading size="xl" weight="bold" variant="muted" className="sm:text-2xl">Bold Weight</Heading>
                </div>
              </CardContent>
            </Card>

            {/* Text Variants */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Hash className="w-5 h-5" />
                  Text Variants
                </CardTitle>
                <CardDescription className="text-base">
                  Different text styles, sizes, and semantic variants
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <Text size="lg" className="sm:text-xl">Extra Large Text (xl)</Text>
                  <Text size="base" className="sm:text-lg">Large Text (lg)</Text>
                  <Text size="sm" className="sm:text-base">Base Text (base)</Text>
                  <Text size="xs" className="sm:text-sm">Small Text (sm)</Text>
                  <Text size="xs">Extra Small Text (xs)</Text>
                </div>
                <div className="space-y-3">
                  <Text variant="default">Default Text</Text>
                  <Text variant="muted">Muted Text</Text>
                  <Text variant="accent">Accent Text</Text>
                  <Text variant="success">Success Text</Text>
                  <Text variant="warning">Warning Text</Text>
                  <Text variant="destructive">Destructive Text</Text>
                </div>
                <div className="space-y-3">
                  <Text weight="normal">Normal Weight</Text>
                  <Text weight="medium">Medium Weight</Text>
                  <Text weight="semibold">Semibold Weight</Text>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CodeIcon className="w-5 h-5" />
                  Code Examples
                </CardTitle>
                <CardDescription className="text-base">
                  Inline and block code with different variants
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <Text className="text-base">Inline code: <Code>const theme = 'dark'</Code></Text>
                  <Text className="text-base">With variant: <Code variant="success">success</Code></Text>
                  <Text className="text-base">With variant: <Code variant="warning">warning</Code></Text>
                  <Text className="text-base">With variant: <Code variant="destructive">error</Code></Text>
                </div>
                <Code block variant="default" size="xs" className="text-xs sm:text-sm">
{`function useTheme() {
  const [theme, setTheme] = useState('light')
  return { theme, setTheme }
}`}
                </Code>
                <div className="space-y-3">
                  <Code size="xs">Small Code</Code>
                  <Code size="xs" className="sm:text-sm">Small Code</Code>
                  <Code size="xs" className="sm:text-base">Base Code</Code>
                  <Code size="xs" className="sm:text-lg">Large Code</Code>
                </div>
              </CardContent>
            </Card>

            {/* Lists and Quotes */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <QuoteIcon className="w-5 h-5" />
                  Lists & Quotes
                </CardTitle>
                <CardDescription className="text-base">
                  Typography components for lists and blockquotes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <Label className="text-base">Unordered List:</Label>
                  <List size="xs" spacing="tight" className="sm:text-sm">
                    <li>First item with tight spacing</li>
                    <li>Second item with tight spacing</li>
                    <li>Third item with tight spacing</li>
                  </List>
                </div>
                <div className="space-y-3">
                  <Label className="text-base">Ordered List:</Label>
                  <List as="ol" size="xs" spacing="normal" className="sm:text-base">
                    <li>First ordered item</li>
                    <li>Second ordered item</li>
                    <li>Third ordered item</li>
                  </List>
                </div>
                <Quote size="xs" variant="muted" cite="Design System" className="sm:text-base">
                  Good typography is invisible. Great typography is invisible and beautiful.
                </Quote>
              </CardContent>
            </Card>

            {/* Labels and Forms */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="w-5 h-5" />
                  Labels & Forms
                </CardTitle>
                <CardDescription className="text-base">
                  Form labels and input styling with typography
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <Label size="xs" className="sm:text-sm">Small Label</Label>
                  <Input placeholder="Small input..." className="text-sm sm:text-base" />
                </div>
                <div className="space-y-3">
                  <Label size="xs" weight="medium" className="sm:text-base">Base Label</Label>
                  <Input placeholder="Base input..." className="text-sm sm:text-base" />
                </div>
                <div className="space-y-3">
                  <Label size="xs" weight="semibold" required className="sm:text-base">Required Label</Label>
                  <Input placeholder="Required input..." className="text-sm sm:text-base" />
                </div>
                <div className="space-y-3">
                  <Label variant="muted" className="text-sm sm:text-base">Muted Label</Label>
                  <Input placeholder="Muted input..." className="text-sm sm:text-base" />
                </div>
              </CardContent>
            </Card>

            {/* Typography Utilities */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Type className="w-5 h-5" />
                  Typography Utilities
                </CardTitle>
                <CardDescription className="text-base">
                  CSS utility classes for consistent typography
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="typography-display text-2xl sm:text-4xl">Display Text</div>
                  <div className="typography-heading text-xl sm:text-2xl">Heading Text</div>
                  <div className="typography-body text-sm sm:text-base">Body Text</div>
                  <div className="typography-caption text-xs sm:text-sm">Caption Text</div>
                </div>
                <div className="space-y-3">
                  <div className="typography-code text-xs sm:text-sm">Inline Code</div>
                  <div className="typography-code-block text-xs sm:text-sm">Block Code</div>
                </div>
                <div className="space-y-3">
                  <div className="responsive-heading text-xl sm:text-2xl lg:text-3xl">Responsive Heading</div>
                  <div className="responsive-text text-sm sm:text-base lg:text-lg">Responsive Text</div>
                </div>
                <div className="space-y-3">
                  <div className="text-spacing-tight text-sm sm:text-base">Tight Spacing</div>
                  <div className="text-spacing-normal text-sm sm:text-base">Normal Spacing</div>
                  <div className="text-spacing-wide text-sm sm:text-base">Wide Spacing</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Component Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Buttons</CardTitle>
                <CardDescription className="text-base">All button variants using the theme system</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" className="text-xs sm:text-sm">Default</Button>
                  <Button variant="secondary" size="sm" className="text-xs sm:text-sm">Secondary</Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">Outline</Button>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Ghost</Button>
                  <Button variant="destructive" size="sm" className="text-xs sm:text-sm">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="text-sm sm:text-base">Default</Button>
                  <Button variant="secondary" className="text-sm sm:text-base">Secondary</Button>
                  <Button variant="outline" className="text-sm sm:text-base">Outline</Button>
                  <Button variant="ghost" className="text-sm sm:text-base">Ghost</Button>
                  <Button variant="destructive" className="text-sm sm:text-base">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="text-sm sm:text-base">Large</Button>
                  <Button variant="secondary" size="lg" className="text-sm sm:text-base">Large</Button>
                  <Button variant="outline" size="lg" className="text-sm sm:text-base">Large</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader className="p-6">
                <CardTitle className="text-xl">Badges</CardTitle>
                <CardDescription className="text-base">Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Badge className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Success
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CodeIcon className="w-3 h-3" />
                    Code
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Text variant="muted" className="typography-caption text-xs sm:text-sm">
                  Built with Next.js, Tailwind CSS, and a comprehensive typography system
                </Text>
                <Text size="xs" variant="muted" className="text-xs">
                  All components use monospace fonts for consistency and developer-friendly aesthetics
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
