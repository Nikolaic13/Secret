import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

export default async function TestDatabasePage() {
  const supabase = await createClient()

  // Test queries
  const tests = {
    foodCategories: { count: 0, success: false, error: null as string | null },
    barangayData: { count: 0, success: false, error: null as string | null },
    profiles: { count: 0, success: false, error: null as string | null },
    foodItems: { count: 0, success: false, error: null as string | null },
  }

  // Test food_categories
  try {
    const { data, error } = await supabase.from("food_categories").select("*", { count: "exact" })

    if (error) throw error
    tests.foodCategories.count = data?.length || 0
    tests.foodCategories.success = true
  } catch (error) {
    tests.foodCategories.error = error instanceof Error ? error.message : "Unknown error"
  }

  // Test barangay_data
  try {
    const { data, error } = await supabase.from("barangay_data").select("*", { count: "exact" })

    if (error) throw error
    tests.barangayData.count = data?.length || 0
    tests.barangayData.success = true
  } catch (error) {
    tests.barangayData.error = error instanceof Error ? error.message : "Unknown error"
  }

  // Test profiles (will be empty but table should exist)
  try {
    const { data, error } = await supabase.from("profiles").select("*", { count: "exact" })

    if (error) throw error
    tests.profiles.count = data?.length || 0
    tests.profiles.success = true
  } catch (error) {
    tests.profiles.error = error instanceof Error ? error.message : "Unknown error"
  }

  // Test food_items (will be empty but table should exist)
  try {
    const { data, error } = await supabase.from("food_items").select("*", { count: "exact" })

    if (error) throw error
    tests.foodItems.count = data?.length || 0
    tests.foodItems.success = true
  } catch (error) {
    tests.foodItems.error = error instanceof Error ? error.message : "Unknown error"
  }

  // Get sample data
  let sampleCategories: any[] = []
  let sampleBarangays: any[] = []

  try {
    const { data } = await supabase
      .from("food_categories")
      .select("category_name, nutritional_priority")
      .order("nutritional_priority", { ascending: false })
      .limit(5)
    sampleCategories = data || []
  } catch (error) {
    console.error("Failed to fetch sample categories:", error)
  }

  try {
    const { data } = await supabase
      .from("barangay_data")
      .select("name, population, urgency_score")
      .order("urgency_score", { ascending: false })
      .limit(5)
    sampleBarangays = data || []
  } catch (error) {
    console.error("Failed to fetch sample barangays:", error)
  }

  const allTestsPassed = Object.values(tests).every((test) => test.success)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Connection Test</h1>
        <p className="text-muted-foreground">
          Testing FoodShare Janiuay Supabase database connection and data integrity
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allTestsPassed ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                All Tests Passed
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                Some Tests Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {allTestsPassed
              ? "Your Supabase database is properly configured and connected."
              : "There are issues with your database configuration."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Individual Test Results */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Food Categories Table
              {tests.foodCategories.success ? (
                <Badge variant="default" className="bg-green-600">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.foodCategories.success ? (
              <p className="text-sm text-muted-foreground">{tests.foodCategories.count} categories found</p>
            ) : (
              <p className="text-sm text-red-600">{tests.foodCategories.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Barangay Data Table
              {tests.barangayData.success ? (
                <Badge variant="default" className="bg-green-600">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.barangayData.success ? (
              <p className="text-sm text-muted-foreground">{tests.barangayData.count} barangays found</p>
            ) : (
              <p className="text-sm text-red-600">{tests.barangayData.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Profiles Table
              {tests.profiles.success ? (
                <Badge variant="default" className="bg-green-600">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.profiles.success ? (
              <p className="text-sm text-muted-foreground">{tests.profiles.count} profiles (ready for users)</p>
            ) : (
              <p className="text-sm text-red-600">{tests.profiles.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Food Items Table
              {tests.foodItems.success ? (
                <Badge variant="default" className="bg-green-600">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Failed</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.foodItems.success ? (
              <p className="text-sm text-muted-foreground">{tests.foodItems.count} donations (ready for items)</p>
            ) : (
              <p className="text-sm text-red-600">{tests.foodItems.error}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Display */}
      {allTestsPassed && (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Top 5 Food Categories by Priority</CardTitle>
              <CardDescription>Highest nutritional priority categories for allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleCategories.map((category) => (
                  <div
                    key={category.category_name}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{category.category_name}</span>
                    <Badge variant="secondary">Priority: {category.nutritional_priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Barangays by Urgency</CardTitle>
              <CardDescription>Most urgent barangays for food allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleBarangays.map((barangay) => (
                  <div key={barangay.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{barangay.name}</span>
                      <p className="text-sm text-muted-foreground">
                        Population: {barangay.population.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Urgency: {barangay.urgency_score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
