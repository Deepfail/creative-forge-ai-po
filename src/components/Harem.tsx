import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Heart, HeartStraight, Plus, Trash, Pencil, Tag, Star, Crown, Shield } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export interface SavedGirl {
  id: string
  name: string
  age: number
  type: string
  personality: string
  summary: string
  image?: string
  createdAt: number
  roles: string[]
  tags: string[]
  tasks: string[]
  favorited: boolean
  rating: number
}

interface HaremProps {
  onBack: () => void
}

const predefinedRoles = [
  'Main Character', 'Love Interest', 'Best Friend', 'Rival', 'Mentor', 'Sidekick',
  'Dominant', 'Submissive', 'Switch', 'Caregiver', 'Little', 'Bratty',
  'Secretary', 'Boss', 'Student', 'Teacher', 'Maid', 'Princess'
]

const predefinedTags = [
  'Sweet', 'Spicy', 'Kinky', 'Vanilla', 'Romantic', 'Wild', 'Gentle', 'Rough',
  'Experienced', 'Innocent', 'Playful', 'Serious', 'Flirty', 'Shy', 'Confident',
  'Mysterious', 'Open', 'Adventurous', 'Traditional', 'Exotic'
]

const predefinedTasks = [
  'Roleplay Partner', 'Conversation', 'Gaming Buddy', 'Story Creation',
  'Fantasy Fulfillment', 'Emotional Support', 'Adventure Guide', 'Trainer',
  'Companion', 'Entertainment', 'Learning Helper', 'Creative Partner'
]

export default function Harem({ onBack }: HaremProps) {
  const [savedGirls, setSavedGirls] = useKV<SavedGirl[]>('saved-girls', [])
  const [selectedGirl, setSelectedGirl] = useState<SavedGirl | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedGirl, setEditedGirl] = useState<SavedGirl | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filteredGirls = (savedGirls || []).filter(girl => {
    const matchesSearch = searchQuery === '' || 
      girl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      girl.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      girl.personality.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = filterRole === 'all' || girl.roles.includes(filterRole)
    const matchesTag = filterTag === 'all' || girl.tags.includes(filterTag)
    const matchesFavorites = !showFavoritesOnly || girl.favorited

    return matchesSearch && matchesRole && matchesTag && matchesFavorites
  })

  const toggleFavorite = (girlId: string) => {
    setSavedGirls(current => 
      (current || []).map(girl => 
        girl.id === girlId ? { ...girl, favorited: !girl.favorited } : girl
      )
    )
  }

  const deleteGirl = (girlId: string) => {
    setSavedGirls(current => (current || []).filter(girl => girl.id !== girlId))
    if (selectedGirl?.id === girlId) {
      setSelectedGirl(null)
    }
    toast.success('Girl removed from harem')
  }

  const startEdit = (girl: SavedGirl) => {
    setEditedGirl({ ...girl })
    setEditMode(true)
  }

  const saveEdit = () => {
    if (!editedGirl) return
    
    setSavedGirls(current => 
      (current || []).map(girl => 
        girl.id === editedGirl.id ? editedGirl : girl
      )
    )
    
    if (selectedGirl?.id === editedGirl.id) {
      setSelectedGirl(editedGirl)
    }
    
    setEditMode(false)
    setEditedGirl(null)
    toast.success('Girl updated successfully')
  }

  const addRole = (role: string) => {
    if (!editedGirl || editedGirl.roles.includes(role)) return
    setEditedGirl(prev => prev ? { ...prev, roles: [...prev.roles, role] } : null)
  }

  const removeRole = (role: string) => {
    if (!editedGirl) return
    setEditedGirl(prev => prev ? { ...prev, roles: prev.roles.filter(r => r !== role) } : null)
  }

  const addTag = (tag: string) => {
    if (!editedGirl || editedGirl.tags.includes(tag)) return
    setEditedGirl(prev => prev ? { ...prev, tags: [...prev.tags, tag] } : null)
  }

  const removeTag = (tag: string) => {
    if (!editedGirl) return
    setEditedGirl(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null)
  }

  const addTask = (task: string) => {
    if (!editedGirl || editedGirl.tasks.includes(task)) return
    setEditedGirl(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : null)
  }

  const removeTask = (task: string) => {
    if (!editedGirl) return
    setEditedGirl(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t !== task) } : null)
  }

  const setRating = (rating: number) => {
    if (!editedGirl) return
    setEditedGirl(prev => prev ? { ...prev, rating } : null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-primary/30 hover:bg-primary/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Crown className="text-accent" size={32} weight="fill" />
            <h1 className="text-3xl font-bold text-foreground">
              My Harem
            </h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {savedGirls?.length || 0} Girls
          </Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search girls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {predefinedRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tag-filter">Filter by Tag</Label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {predefinedTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="w-full"
                >
                  <Heart size={16} className="mr-2" weight={showFavoritesOnly ? "fill" : "regular"} />
                  Favorites
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterRole('all')
                    setFilterTag('all')
                    setShowFavoritesOnly(false)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {(!savedGirls || savedGirls.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <Crown className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-xl font-semibold text-foreground mb-2">Your Harem is Empty</h3>
              <p className="text-muted-foreground mb-4">
                Generate some girls first to start building your collection!
              </p>
              <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
                Generate Girls
              </Button>
            </CardContent>
          </Card>
        )}

        {savedGirls && savedGirls.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Girls Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGirls.map(girl => (
                  <Card 
                    key={girl.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedGirl?.id === girl.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedGirl(girl)}
                  >
                    <CardContent className="p-4">
                      {girl.image && (
                        <img 
                          src={girl.image}
                          alt={girl.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{girl.name}</h3>
                          <p className="text-sm text-muted-foreground">{girl.age} • {girl.type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(girl.id)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Heart 
                              size={16} 
                              weight={girl.favorited ? "fill" : "regular"}
                              className={girl.favorited ? "text-red-500" : "text-muted-foreground"}
                            />
                          </Button>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                weight={i < girl.rating ? "fill" : "regular"}
                                className={i < girl.rating ? "text-yellow-400" : "text-muted-foreground"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {girl.personality}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {girl.roles.slice(0, 2).map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                        {girl.roles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{girl.roles.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Girl Details */}
            <div className="lg:col-span-1">
              {selectedGirl && (
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedGirl.name}</CardTitle>
                        <p className="text-muted-foreground">{selectedGirl.age} years old • {selectedGirl.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(selectedGirl)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGirl(selectedGirl.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedGirl.image && (
                      <img 
                        src={selectedGirl.image}
                        alt={selectedGirl.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        Personality
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedGirl.personality}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{selectedGirl.summary}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Crown size={16} className="text-accent" />
                        Roles
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGirl.roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Tag size={16} className="text-secondary" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGirl.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tasks</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGirl.tasks.map(task => (
                          <Badge key={task} className="text-xs bg-primary/20 text-primary">
                            {task}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              weight={i < selectedGirl.rating ? "fill" : "regular"}
                              className={i < selectedGirl.rating ? "text-yellow-400" : "text-muted-foreground"}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedGirl.id)}
                      >
                        <Heart 
                          size={16} 
                          weight={selectedGirl.favorited ? "fill" : "regular"}
                          className={selectedGirl.favorited ? "text-red-500" : "text-muted-foreground"}
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {editedGirl?.name}</DialogTitle>
            </DialogHeader>
            {editedGirl && (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editedGirl.name}
                      onChange={(e) => setEditedGirl(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-age">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editedGirl.age}
                      onChange={(e) => setEditedGirl(prev => prev ? { ...prev, age: parseInt(e.target.value) || 18 } : null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Input
                    id="edit-type"
                    value={editedGirl.type}
                    onChange={(e) => setEditedGirl(prev => prev ? { ...prev, type: e.target.value } : null)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-personality">Personality</Label>
                  <Textarea
                    id="edit-personality"
                    value={editedGirl.personality}
                    onChange={(e) => setEditedGirl(prev => prev ? { ...prev, personality: e.target.value } : null)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-summary">Summary</Label>
                  <Textarea
                    id="edit-summary"
                    value={editedGirl.summary}
                    onChange={(e) => setEditedGirl(prev => prev ? { ...prev, summary: e.target.value } : null)}
                  />
                </div>

                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRating(rating)}
                        className="p-1"
                      >
                        <Star
                          size={20}
                          weight={rating <= editedGirl.rating ? "fill" : "regular"}
                          className={rating <= editedGirl.rating ? "text-yellow-400" : "text-muted-foreground"}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Roles</Label>
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {editedGirl.roles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeRole(role)}>
                        {role} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedRoles.filter(role => !editedGirl.roles.includes(role)).map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {editedGirl.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedTags.filter(tag => !editedGirl.tags.includes(tag)).map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tasks</Label>
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {editedGirl.tasks.map(task => (
                      <Badge key={task} className="text-xs cursor-pointer bg-primary/20 text-primary" onClick={() => removeTask(task)}>
                        {task} ×
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedTasks.filter(task => !editedGirl.tasks.includes(task)).map(task => (
                        <SelectItem key={task} value={task}>{task}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setEditMode(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={saveEdit} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}