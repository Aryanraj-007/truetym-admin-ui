# Code Review Best Practices: Ideal PR Size

## General Guidelines

1. **Number of Files:**

   - Aim for 1-10 files per pull request
   - Absolute maximum: 20 files (excluding auto-generated files)

2. **Lines of Code:**

   - Ideal: 200-400 lines of code changed
   - Maximum: 500-1000 lines of code changed

3. **Review Time:**
   - Target: PRs that can be reviewed in 60 minutes or less
   - Maximum: PRs that take no more than 90 minutes to review

## Considerations

- **Complexity matters:** A PR changing 200 lines across 5 complex files might be harder to review than 400 lines in 2 simple files.
- **Context is key:** Changes to critical systems or core functionality may warrant smaller PRs.
- **Team experience:** More experienced teams might handle slightly larger PRs.
- **Review fatigue:** Reviewer effectiveness decreases after about 60 minutes of continuous review.

## Tips for Managing Large Changes

1. Break large features into smaller, logical chunks
2. Use feature flags to merge incomplete features
3. Separate refactoring from feature changes
4. Create separate PRs for documentation updates
5. Use stacked PRs for dependent changes

Remember, these are guidelines, not strict rules. The goal is to facilitate effective reviews that catch issues without overwhelming reviewers.
