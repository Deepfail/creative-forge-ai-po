import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Heart, HeartStraight, Plus, Trash, Pencil, Tag, Star, Crown, Shield, X } from '@phosphor-icons/react'
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
  const [customTags, setCustomTags] = useKV<string[]>('custom-tags', [])
  const [customRoles, setCustomRoles] = useKV<string[]>('custom-roles', [])
  const [customTasks, setCustomTasks] = useKV<string[]>('custom-tasks', [])
  const [selectedGirl, setSelectedGirl] = useState<SavedGirl | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedGirl, setEditedGirl] = useState<SavedGirl | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [newCustomTag, setNewCustomTag] = useState('')
  const [newCustomRole, setNewCustomRole] = useState('')
  const [newCustomTask, setNewCustomTask] = useState('')
  const [showCustomTagManager, setShowCustomTagManager] = useState(false)

  // Get all available tags (predefined + custom)
  const allTags = [...predefinedTags, ...(customTags || [])]
  const allRoles = [...predefinedRoles, ...(customRoles || [])]
  const allTasks = [...predefinedTasks, ...(customTasks || [])]

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

  const addCustomTag = () => {
    if (!newCustomTag.trim()) return
    const trimmedTag = newCustomTag.trim()
    
    // Check if tag already exists (case insensitive)
    const exists = allTags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())
    if (exists) {
      toast.error('Tag already exists')
      return
    }
    
    setCustomTags(current => [...(current || []), trimmedTag])
    setNewCustomTag('')
    toast.success('Custom tag added!')
  }

  const addCustomRole = () => {
    if (!newCustomRole.trim()) return
    const trimmedRole = newCustomRole.trim()
    
    const exists = allRoles.some(role => role.toLowerCase() === trimmedRole.toLowerCase())
    if (exists) {
      toast.error('Role already exists')
      return
    }
    
    setCustomRoles(current => [...(current || []), trimmedRole])
    setNewCustomRole('')
    toast.success('Custom role added!')
  }

  const addCustomTask = () => {
    if (!newCustomTask.trim()) return
    const trimmedTask = newCustomTask.trim()
    
    const exists = allTasks.some(task => task.toLowerCase() === trimmedTask.toLowerCase())
    if (exists) {
      toast.error('Task already exists')
      return
    }
    
    setCustomTasks(current => [...(current || []), trimmedTask])
    setNewCustomTask('')
    toast.success('Custom task added!')
  }

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTags(current => (current || []).filter(tag => tag !== tagToRemove))
    toast.success('Custom tag removed')
  }

  const removeCustomRole = (roleToRemove: string) => {
    setCustomRoles(current => (current || []).filter(role => role !== roleToRemove))
    toast.success('Custom role removed')
  }

  const removeCustomTask = (taskToRemove: string) => {
    setCustomTasks(current => (current || []).filter(task => task !== taskToRemove))
    toast.success('Custom task removed')
  }
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
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomTagManager(true)}
                className="border-secondary/30 hover:bg-secondary/10"
              >
                <Tag size={16} className="mr-2" />
                Manage Tags
              </Button>
              <Badge variant="secondary">
                {savedGirls?.length || 0} Girls
              </Badge>
            </div>
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
                    {allRoles.map(role => (
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
                    {allTags.map(tag => (
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
                      {allRoles.filter(role => !editedGirl.roles.includes(role)).map(role => (
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
                  <div className="flex gap-2">
                    <Select onValueChange={addTag}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add tag..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allTags.filter(tag => !editedGirl.tags.includes(tag)).map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Custom tag..."
                        value={newCustomTag}
                        onChange={(e) => setNewCustomTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomTag()
                            if (newCustomTag.trim()) {
                              addTag(newCustomTag.trim())
                            }
                          }
                        }}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addCustomTag()
                          if (newCustomTag.trim()) {
                            addTag(newCustomTag.trim())
                          }
                        }}
                        className="px-2"
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
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
                      {allTasks.filter(task => !editedGirl.tasks.includes(task)).map(task => (
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

        {/* Custom Tag Manager Dialog */}
        <Dialog open={showCustomTagManager} onOpenChange={setShowCustomTagManager}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Custom Tags, Roles & Tasks</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Custom Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag size={20} className="text-secondary" />
                  Custom Tags
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new tag..."
                      value={newCustomTag}
                      onChange={(e) => setNewCustomTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomTag()
                        }
                      }}
                    />
                    <Button onClick={addCustomTag} size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(customTags || []).map(tag => (
                      <div key={tag} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{tag}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomTag(tag)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                    {(!customTags || customTags.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">No custom tags yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Roles */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Crown size={20} className="text-accent" />
                  Custom Roles
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new role..."
                      value={newCustomRole}
                      onChange={(e) => setNewCustomRole(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomRole()
                        }
                      }}
                    />
                    <Button onClick={addCustomRole} size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(customRoles || []).map(role => (
                      <div key={role} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{role}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomRole(role)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                    {(!customRoles || customRoles.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">No custom roles yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Tasks */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Custom Tasks
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new task..."
                      value={newCustomTask}
                      onChange={(e) => setNewCustomTask(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomTask()
                        }
                      }}
                    />
                    <Button onClick={addCustomTask} size="sm">
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(customTasks || []).map(task => (
                      <div key={task} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm">{task}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomTask(task)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                    {(!customTasks || customTasks.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">No custom tasks yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button onClick={() => setShowCustomTagManager(false)} variant="outline">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}