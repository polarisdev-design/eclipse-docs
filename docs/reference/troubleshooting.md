# Troubleshooting

## The editor does not start

Confirm both Eclipse roots were installed, the client Runtime has RunContext = Client, and the experience uses R15. Read the first Eclipse error in Output; missing stored UI names or failed module startup can stop binding.

## Animation permission errors

The experience must be allowed to load the stored CustomizationIdle animation. Replace its asset with one available to the experience when needed.

## Saves fail in Studio

Check API-service access in the test experience, the output error, rate limits and the storage driver's response. A failed read must not be treated as a blank profile.

## An import differs

Read the review's omitted and adjusted notices. Configured limits may clamp transforms or body scale. Mesh and texture assets can be restricted. Unsupported transfer data is listed before application.

Raw meshes must have one effective body attachment. A second default head weld can pull different limbs together. Eclipse's mesh loader supplies an attachment before insertion and restores the saved placement.

## UI editing breaks a control

Check the stored instance names expected by its binder. Keep template descendants and the viewport WorldModel. Test selection and close/reopen after changing assets.

## Identity does not change

Check byte limits, change rate and the text-filter result. Other players read accepted character attributes; displaying unfiltered local drafts bypasses that boundary.

## GitHub Pages shows a missing site

Set Settings → Pages → Source to GitHub Actions, then check the deployment workflow in Actions. This package publishes pushes to main. Its workflow derives the base path from Pages settings, so repository subpaths and custom domains are handled during deployment.
