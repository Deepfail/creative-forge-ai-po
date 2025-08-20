# AI Creative Generator - Copilot Instructions

**CRITICAL: Always follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

This is an AI Creative Generator web application for NSFW content creation, built with React/TypeScript, Vite, and GitHub Spark framework. The application supports multiple AI providers (Internal, OpenRouter, Venice.ai) for generating characters, scenarios, and interactive experiences.

## Quick Setup & Validation

Bootstrap and validate the repository in this exact order:

1. **Install dependencies**: `npm install` -- takes ~40 seconds
2. **Build the application**: `npm run build` -- takes ~10 seconds, NEVER CANCEL. Set timeout to 60+ minutes for safety
3. **Start development server**: `npm run dev` -- starts immediately on http://localhost:5000
4. **Validate application**: Open browser to http://localhost:5000, verify UI loads and shows "NSFW AI Generator" header
5. **Test core functionality**: Click through different modes (Random Scenario, Build Your Own, Generate Girls) to ensure navigation works

## Development Workflow

### Essential Commands
- **Development server**: `npm run dev` -- runs on http://localhost:5000 with hot reload
- **Production build**: `npm run build` -- TypeScript compilation + Vite build (~10 seconds)
- **Preview build**: `npm run preview` -- serves production build on http://localhost:4173
- **Dependency management**: `npm install` for new packages

### Linting & Code Quality
- **IMPORTANT**: ESLint configuration is missing/broken. Running `npm run lint` will fail with "ESLint couldn't find an eslint.config.js file"
- **Workaround**: Use your editor's TypeScript checking instead of the lint command
- **Before committing**: Always run `npm run build` to catch TypeScript errors since linting is broken

### Build Timing (NEVER CANCEL)
- **npm install**: 30-45 seconds
- **npm run build**: 8-12 seconds (includes TypeScript + Vite)
- **npm run dev startup**: <10 seconds to ready state

## Application Architecture

### Core Technology Stack
- **Frontend**: React 19 + TypeScript + Vite 6
- **Framework**: GitHub Spark with built-in AI integration
- **UI Components**: Radix UI + Tailwind CSS + Phosphor Icons
- **State Management**: React hooks + GitHub Spark useKV
- **AI Integration**: Multi-provider support (Internal/OpenRouter/Venice.ai)

### Key Components & Files
- **Main App**: `src/App.tsx` -- primary navigation and mode switching
- **AI Service**: `src/lib/ai-service.ts` -- handles all AI provider integrations  
- **API Settings**: `src/components/ApiSettings.tsx` -- configuration for AI providers
- **Generation Modes**: 
  - `src/components/SimpleMode.tsx` -- form-based creation
  - `src/components/InteractiveMode.tsx` -- guided experience
  - `src/components/RandomGenerator.tsx` -- random content generation
  - `src/components/CustomChatBuilder.tsx` -- chat with AI assistant
  - `src/components/GenerateGirls.tsx` -- character generation

### Configuration Files
- **Vite**: `vite.config.ts` -- build configuration with Spark plugins
- **TypeScript**: `tsconfig.json` -- TypeScript compiler options
- **Tailwind**: `tailwind.config.js` -- styling configuration with custom theme
- **Package**: `package.json` -- dependencies and scripts

## Manual Validation Requirements

**CRITICAL**: After any changes, always perform complete validation by running through these user scenarios:

### Scenario 1: Basic Navigation Test
1. Start dev server: `npm run dev`
2. Open http://localhost:5000
3. Verify main interface loads with "NSFW AI Generator" header
4. Click each navigation option: Random Scenario, Build Your Own, Generate Girls, My Harem
5. Verify each page loads without errors and shows appropriate content
6. Test "Back" button functionality

### Scenario 2: API Configuration Test  
1. Click "API Settings" button in header
2. Verify modal opens with three tabs: Internal AI, OpenRouter, Venice.ai
3. Switch between tabs and verify different configuration options appear
4. Test "Cancel" and form field interactions
5. Verify Venice.ai tab shows API key field and model dropdown

### Scenario 3: Content Generation Test
1. Navigate to Random Scenario
2. Click "Generate Random Character" button
3. **Expected**: Should show loading state, then either:
   - Success: Generated content appears
   - Error: Clear error message about API configuration needed
4. Test other generation features in different modes

### Build Validation
1. **Always run**: `npm run build` before committing changes
2. **Verify**: Build completes without TypeScript errors
3. **Test preview**: `npm run preview` and verify http://localhost:4173 works
4. **Check bundle**: Look for "built in" message showing successful completion

## Common Issues & Solutions

### ESLint Configuration Missing
- **Problem**: `npm run lint` fails with config not found
- **Solution**: Skip linting, rely on TypeScript compiler and editor checking
- **Alternative**: Use `npm run build` to catch type errors

### API Calls Failing (403/404 errors)
- **Expected**: App shows API errors without valid keys configured
- **Solution**: This is normal - app gracefully handles missing API configuration
- **Testing**: Use Internal AI provider or configure valid API keys for external providers

### Build Warnings About Large Chunks
- **Expected**: Vite warns about 500KB+ chunks due to comprehensive UI library
- **Solution**: This is normal for this application architecture
- **Impact**: Does not affect functionality, only bundle size optimization

## Working with AI Features

### AI Provider Configuration
- **Internal AI**: Built-in Spark LLM, no API key required
- **OpenRouter**: Requires API key from openrouter.ai
- **Venice.ai**: Requires API key from venice.ai/api, specializes in uncensored content

### Testing AI Integration
1. **Without API keys**: App will show errors but won't crash
2. **With Internal AI**: Should work immediately 
3. **Testing connections**: Use "Test Connection" button in API settings
4. **Expected behavior**: Generation attempts without valid config show user-friendly errors

### Content Generation Workflows
- **Simple Mode**: Direct form-based creation for experienced users
- **Interactive Mode**: Guided questions and scenarios for discovery
- **Random Generator**: Completely random content generation
- **Custom Chat**: Conversational interface with AI assistant
- **Generate Girls**: Specialized character creation

## File Structure Reference

```
src/
├── App.tsx                    # Main application shell
├── components/
│   ├── ApiSettings.tsx        # AI provider configuration
│   ├── SimpleMode.tsx         # Form-based creation
│   ├── InteractiveMode.tsx    # Guided experience
│   ├── RandomGenerator.tsx    # Random content generation
│   ├── CustomChatBuilder.tsx  # Chat interface
│   ├── GenerateGirls.tsx      # Character generation
│   ├── Harem.tsx             # Saved content management
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── ai-service.ts         # AI provider integrations
│   └── utils.ts              # Utility functions
└── styles/                   # CSS and styling
```

## Validation Checklist

Before completing any task:
- [ ] Run `npm run build` and verify successful completion
- [ ] Test dev server starts: `npm run dev` 
- [ ] Load http://localhost:5000 and verify UI appears correctly
- [ ] Navigate through main application modes
- [ ] Test at least one generation feature (expect API errors without keys)
- [ ] Verify no console errors that would break functionality
- [ ] Check that TypeScript compilation succeeds

Remember: This application handles adult content generation and requires careful testing of user workflows to ensure all features remain accessible and functional.