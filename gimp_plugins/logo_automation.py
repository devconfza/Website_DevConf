#!/usr/bin/env python

from gimpfu import *
import gimpenums

def automate_image_workflow_with_width(image, drawable, canvas_width, background_color):
    # Ensure the image has 32-bit floating point precision
    if image.precision != gimpenums.PRECISION_FLOAT_GAMMA:
        pdb.gimp_image_convert_precision(image, gimpenums.PRECISION_FLOAT_GAMMA)
        gimp.message("Image precision set to 32-bit floating point.")
    else:
        gimp.message("Image is already in 32-bit floating point precision.")

    # Calculate canvas height based on 4:3 aspect ratio
    canvas_height = int(round((canvas_width * 3.0) / 4.0))

    # 1. Crop to content
    pdb.gimp_image_crop(image, image.width, image.height, 0, 0)

    # 2. Scale the image to fit within (canvas_width - 20) x (canvas_height - 20)
    target_width = canvas_width - 20
    target_height = canvas_height - 20
    image_width = image.width
    image_height = image.height

    if float(image_width) / image_height > float(target_width) / target_height:
        # Image is wider than target aspect ratio, scale based on width
        new_width = target_width
        new_height = int(round(image_height * (float(target_width) / image_width)))
    else:
        # Image is taller or has the same aspect ratio, scale based on height
        new_height = target_height
        new_width = int(round(image_width * (float(target_height) / image_height)))

    pdb.gimp_image_scale(image, new_width, new_height)

    # 3. Increase canvas size to canvas_width x canvas_height and center the image
    x_offset = (canvas_width - new_width) / 2
    y_offset = (canvas_height - new_height) / 2

    pdb.gimp_image_resize(image, canvas_width, canvas_height, x_offset, y_offset)

    # 4. Put a background with the specified color (default is white)
    layer = gimp.Layer(image, "Background", canvas_width, canvas_height, RGB_IMAGE, 100, NORMAL_MODE)

    if background_color:
        pdb.gimp_context_set_background(background_color)
        layer.fill(BACKGROUND_FILL)
    else:
        layer.fill(WHITE_FILL)

    image.add_layer(layer, 1) # Add as the bottom layer

register(
    "python_fu_automate_workflow_with_width_bg",
    "DevConf Sponsor Logo Automation (Custom Width & BG)",
    "Applies a predefined workflow with custom width, height (4:3), and optional background color.",
    "",
    "",
    "2025",
    "<Image>/Filters/Automate Workflow (Custom Width & BG)",
    "*",
    [
        (PF_INT, "canvas_width", "Canvas Width", 200),
        (PF_COLOR, "background_color", "Background Color", (255, 255, 255)) # Default to white
    ],
   [],
    automate_image_workflow_with_width
)

main()