# atril — documentation viewer for charly-vibes projects

# Default: list recipes
default:
    @just --list

# Install dependencies
install:
    bun install

# Build the project
build:
    bun run build

# Run tests
test:
    bun run test

# Validate spec-test correspondence (requires ah)
validate:
    ah check

# Lint
lint:
    bun run lint

# Format source files
fmt:
    bun run fmt
