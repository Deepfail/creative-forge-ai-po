# AI Creative Generator - Product Requirements Document

A comprehensive AI-powered tool that helps users create characters, scenarios, games, and prompts through both simple input forms and guided interactive experiences.

**Experience Qualities**:
1. **Intuitive** - Users should feel confident navigating between modes and creating content without technical barriers
2. **Inspiring** - The tool should spark creativity and help users discover possibilities they hadn't considered
3. **Polished** - Every interaction should feel smooth and professional, building trust in the AI-generated output

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple creation modes with different UI patterns and workflows, persistent state for work-in-progress creations, AI integration for content generation, and export functionality to various platforms

## Essential Features

### Simple Mode Creation
- **Functionality**: Form-based creation with dropdowns, checkboxes, and text inputs for rapid content generation
- **Purpose**: Enables experienced users to quickly specify exactly what they want without guidance
- **Trigger**: User selects "Simple Mode" and chooses creation type (Character/Scenario/Game/Prompt)
- **Progression**: Select type → Fill form fields → Preview AI suggestions → Refine → Export
- **Success criteria**: User can create and export content in under 2 minutes

### Interactive Mode Creation
- **Functionality**: Guided experience with questions, mini-scenarios, and visual elements to help users discover what they want
- **Purpose**: Helps users who need inspiration or aren't sure exactly what they want to create
- **Trigger**: User selects "Interactive Mode" and chooses creation type
- **Progression**: Introduction → Question sequence → Visual choices → Scenario building → Review → Export
- **Success criteria**: Users report feeling inspired and create content they're excited about

### AI Content Generation
- **Functionality**: Uses LLM to generate detailed, creative content based on user inputs and choices
- **Purpose**: Transforms basic user inputs into rich, detailed creative content
- **Trigger**: User completes input phase in either mode
- **Progression**: Collect inputs → Generate AI prompt → Process with LLM → Present results → Allow refinement
- **Success criteria**: Generated content feels personal and usable across different target platforms

### Multi-Platform Export
- **Functionality**: Formats and exports created content for different platforms (SillyTavern, ChatGPT, Claude, etc.)
- **Purpose**: Ensures users can immediately use their creations in their preferred tools
- **Trigger**: User clicks export after reviewing generated content
- **Progression**: Select target platform → Format content → Generate export file/text → Provide download/copy
- **Success criteria**: Exported content works seamlessly in target platforms

### Progress Persistence
- **Functionality**: Saves work-in-progress creations so users can return and continue later
- **Purpose**: Reduces pressure to complete everything in one session
- **Trigger**: Automatic saving during creation process
- **Progression**: Auto-save during creation → Load saved projects → Resume from last step
- **Success criteria**: No user ever loses their work due to browser issues or time constraints

## Edge Case Handling

- **Empty inputs**: Provide smart defaults and example suggestions when users haven't provided enough detail
- **AI generation failures**: Fallback to template-based generation with clear messaging about trying again
- **Incomplete sessions**: Allow users to save partial work and resume later with contextual hints
- **Export format errors**: Validate exports before download and provide format-specific troubleshooting
- **Large content**: Handle long-form generated content with proper formatting and chunking for different platforms

## Design Direction

The interface should feel like a creative studio - professional yet inspiring, with clean forms that don't intimidate and interactive elements that feel like a guided conversation rather than a clinical survey.

## Color Selection

Triadic color scheme to create visual interest while maintaining professional credibility and clear functional distinctions.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 270)` - Represents creativity and AI intelligence
- **Secondary Colors**: Warm Orange `oklch(0.65 0.15 45)` for interactive elements, Forest Green `oklch(0.55 0.12 135)` for success states
- **Accent Color**: Bright Coral `oklch(0.7 0.2 15)` for CTAs and important interactive elements
- **Foreground/Background Pairings**: 
  - Background (White `oklch(1 0 0)`): Dark Purple text `oklch(0.2 0.05 270)` - Ratio 8.1:1 ✓
  - Card (Light Gray `oklch(0.98 0 0)`): Dark Purple text `oklch(0.2 0.05 270)` - Ratio 7.8:1 ✓
  - Primary (Deep Purple `oklch(0.45 0.15 270)`): White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
  - Secondary (Warm Orange `oklch(0.65 0.15 45)`): White text `oklch(1 0 0)` - Ratio 3.8:1 ✓
  - Accent (Bright Coral `oklch(0.7 0.2 15)`): White text `oklch(1 0 0)` - Ratio 3.1:1 ✓

## Font Selection

Typography should feel both creative and trustworthy, balancing approachability with professional polish.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Subsections): Inter Medium/18px/normal spacing
  - Body (Forms/Content): Inter Regular/16px/relaxed line height
  - Labels: Inter Medium/14px/wide letter spacing
  - Captions: Inter Regular/12px/normal spacing

## Animations

Smooth, purposeful animations that guide users through the creation process and provide satisfying feedback without feeling gimmicky.

- **Purposeful Meaning**: Animations should reinforce the creative flow and make the AI generation process feel magical but reliable
- **Hierarchy of Movement**: Mode transitions deserve the most animation focus, followed by AI generation states, then micro-interactions on form elements

## Component Selection

- **Components**: Cards for creation modes, Forms for simple mode, Dialog for export options, Tabs for different creation types, Progress indicators for interactive mode, Buttons with distinct styling for primary/secondary actions
- **Customizations**: Custom stepper component for interactive mode, branded loading animations for AI generation, custom export preview cards
- **States**: Buttons show loading states during AI generation, form fields highlight validation errors, progress indicators show completion status
- **Icon Selection**: Sparkles for AI generation, Download for exports, ArrowRight for progression, User/GameController2/FileText for creation types
- **Spacing**: Generous padding (p-6/p-8) for main sections, consistent gaps (gap-4/gap-6) between related elements
- **Mobile**: Stack creation mode cards vertically, collapse complex forms into progressive steps, ensure export dialogs are touch-friendly