# AI Adult Creative Generator - Product Requirements Document

A comprehensive AI-powered tool that helps users create NSFW characters and scenarios through both simple input forms and guided interactive experiences.

**Experience Qualities**:
1. **Provocative** - Users should feel empowered to explore their creativity in adult content without judgment
2. **Sophisticated** - The tool should feel polished and professional despite the adult nature
3. **Discreet** - Interface should be tasteful while clearly indicating adult content

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple creation modes with different UI patterns and workflows, persistent state for work-in-progress creations, AI integration for NSFW content generation, and export functionality to various adult platforms

## Essential Features

### Interactive Mode Creation
- **Functionality**: Comprehensive form-based creation with advanced controls, tag selection, NSFW level configuration, and professional-grade customization options
- **Purpose**: Enables users to create detailed adult content with precise control over every aspect 
- **Trigger**: User selects "Interactive Mode" and chooses creation type (Character/Scenario with game option)
- **Progression**: Select type → Configure detailed settings → Select tags/characteristics → Add custom details → Generate AI content → Export
- **Success criteria**: Users can create professionally detailed and customized adult content with full control

### Chat Mode Creation
- **Functionality**: Conversational interface with Luna, a flirty AI assistant who discovers user preferences through natural dialogue
- **Purpose**: Creates a personalized, engaging experience where AI infers desires from conversation rather than forms
- **Trigger**: User selects "Chat" button for any creation type
- **Progression**: Chat introduction → Flirty conversation → Preference discovery → Content generation → Export
- **Success criteria**: Users feel entertained by the process and get exactly what they envisioned through natural conversation

### Random Generator
- **Functionality**: Instant random generation of NSFW content using hundreds of preset combinations for genres, tones, traits, and settings
- **Purpose**: Provides instant inspiration and helps users discover new kinks or scenarios they hadn't considered
- **Trigger**: User selects "Random" button for any creation type
- **Progression**: Click generate → Random seed selection → AI content generation → Review → Re-generate or export
- **Success criteria**: Users find unexpected and inspiring content combinations that lead to new creative directions

### Generate Girls Section
- **Functionality**: Dedicated section for generating random female characters with unique personalities, types, and characteristics
- **Purpose**: Provides quick access to diverse female character archetypes with visual placeholders for AI-generated images
- **Trigger**: User clicks "Generate Random Girls" from main page
- **Progression**: Click generate → Display 4 random girls → Show details (name, age, type, personality, summary) → Select favorites → Export
- **Success criteria**: Users discover appealing character types and can easily generate variations

### AI NSFW Content Generation
- **Functionality**: Uses configurable AI providers (Internal, OpenRouter, Venice.ai) to generate detailed, explicit creative content based on user inputs and adult preferences
- **Purpose**: Transforms basic user inputs into rich, detailed adult creative content using the user's preferred AI service
- **Trigger**: User completes input phase in either mode
- **Progression**: Collect inputs → Generate NSFW AI prompt → Process with configured AI provider → Present results with content warnings → Allow refinement
- **Success criteria**: Generated content feels personal, appropriately explicit, and usable across different adult platforms

### Multi-Platform Export
- **Functionality**: Formats and exports created content for different platforms (SillyTavern for characters, prompt instructions for scenarios)
- **Purpose**: Ensures users can immediately use their creations in their preferred adult entertainment tools
- **Trigger**: User clicks export after reviewing generated content
- **Progression**: Select target platform → Format content → Generate export file/text → Provide download/copy
- **Success criteria**: Exported content works seamlessly in target adult platforms

### API Configuration System
- **Functionality**: Users can configure their preferred AI provider from Internal (free), OpenRouter (multiple models), or Venice.ai (uncensored models) with Venice as default
- **Purpose**: Allows users to choose their preferred AI service, with Venice AI auto model providing optimal uncensored content generation
- **Trigger**: User clicks "API Settings" button in header
- **Progression**: Open settings → Select provider (Venice default) → Enter API key if required → Test connection → Save configuration
- **Success criteria**: Users can seamlessly use Venice AI for optimal adult content generation or switch providers as needed

### Harem Management System
- **Functionality**: Save, organize, and manage generated female characters with roles, tags, tasks, ratings, and favorites. Users can create custom tags, roles, and tasks beyond the predefined options.
- **Purpose**: Allows users to build and maintain a persistent collection of favorite characters with detailed metadata and personalized organization system
- **Trigger**: User clicks "Save to Harem" on any generated girl or accesses "My Harem" from main menu
- **Progression**: Save characters → Assign roles/tags/tasks (predefined or custom) → Rate and favorite → Filter and search collection → Edit details → Manage custom tags/roles/tasks
- **Success criteria**: Users can effectively organize and retrieve their favorite characters with rich metadata for different scenarios, and can create custom organizational systems that match their preferences

### Custom Tag Management
- **Functionality**: Create, edit, and delete custom tags, roles, and tasks for organizing characters beyond predefined options
- **Purpose**: Provides personalized organization system that adapts to user's specific interests and categorization needs
- **Trigger**: User clicks "Manage Tags" button in Harem section or creates new tags during character editing
- **Progression**: Access tag manager → Add custom tags/roles/tasks → Remove unwanted custom items → Use in character assignment
- **Success criteria**: Users can create unlimited custom organizational categories and seamlessly use them throughout the character management system

### Venice AI Integration
- **Functionality**: Built-in Venice AI for uncensored image generation using auto model selection, integrated text and image generation pipeline
- **Purpose**: Provides high-quality, uncensored AI content generation specifically optimized for adult content creation
- **Trigger**: Automatic for all AI generation, uses Venice "default" model for optimal results
- **Progression**: User input → Venice AI generation (text and images) → Display results → Save to harem if character
- **Success criteria**: Seamless AI generation with appropriate adult content quality using Venice auto model selection

### Progress Persistence
- **Functionality**: Saves work-in-progress adult creations so users can return and continue later
- **Purpose**: Reduces pressure to complete everything in one session
- **Trigger**: Automatic saving during creation process
- **Progression**: Auto-save during creation → Load saved projects → Resume from last step
- **Success criteria**: No user ever loses their adult content work due to browser issues

## Edge Case Handling

- **Age verification**: Clear 18+ warnings and content indication throughout
- **Content boundaries**: Respect user-specified limits and NSFW levels
- **AI generation failures**: Fallback with clear messaging while maintaining adult context
- **Export compatibility**: Ensure adult content formats properly for each target platform
- **Content warnings**: Automatically include appropriate warnings in generated content

## Design Direction

The interface should feel like a sophisticated adult entertainment studio - dark, sleek, and professional with neon accents that suggest both high-tech capability and adult entertainment aesthetics.

## Color Selection

Dark theme with bright neon accents to create a sophisticated yet provocative atmosphere.

- **Primary Color**: Neon Green `oklch(0.75 0.25 135)` - Represents technology and energy
- **Secondary Color**: Bright Pink `oklch(0.7 0.3 340)` - Playful and provocative accent
- **Accent Color**: Neon Cyan `oklch(0.8 0.2 190)` - High-tech sophistication
- **Background**: Deep Dark `oklch(0.08 0.02 270)` - Professional darkness
- **Foreground/Background Pairings**: 
  - Background (Deep Dark): Bright White text `oklch(0.95 0.01 270)` - High contrast
  - Card (Dark Gray): Bright White text - Clean separation
  - Primary (Neon Green): Dark text for readability
  - Secondary (Bright Pink): Dark text for contrast
  - Accent (Neon Cyan): Dark text for accessibility

## Font Selection

Typography should feel both modern and sophisticated, balancing readability with a high-tech aesthetic.

- **Font Choice**: Inter - Clean, modern, highly legible
- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/36px/tight spacing for impact
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Subsections): Inter Medium/20px/normal spacing
  - Body (Forms/Content): Inter Regular/16px/relaxed line height
  - Labels: Inter Medium/14px/wide letter spacing
  - Captions: Inter Regular/12px/normal spacing

## Animations

Smooth, sophisticated animations that enhance the premium feel while providing clear feedback during the adult content creation process.

- **Purposeful Meaning**: Animations should reinforce the professional yet playful nature of adult content creation
- **Hierarchy of Movement**: Mode transitions and AI generation states deserve focus, with subtle hover effects on interactive elements

## Component Selection

- **Components**: Cards with neon borders for creation modes, Forms with dark styling, Dialog for export options, Progress indicators with neon accents, Buttons with gradient effects for CTAs
- **Customizations**: Dark theme variants for all components, neon accent colors, custom adult content indicators
- **States**: Buttons show loading states with neon animations, form fields highlight with accent colors, validation uses appropriate colors
- **Icon Selection**: Sparkles for AI generation, GameController2 for scenarios, User for characters, Download for exports
- **Spacing**: Generous padding for comfortable reading in dark theme, consistent gaps between related elements
- **Mobile**: Responsive design that maintains sophistication on smaller screens

## Content Guidelines

- Clear 18+ age verification and warnings
- Respectful handling of adult content with appropriate boundaries
- Professional presentation despite explicit nature
- Content warnings and user control over explicitness levels
- Export formats optimized for popular adult entertainment platforms