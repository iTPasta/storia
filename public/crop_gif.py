import os
from PIL import Image, ImageSequence

# Zone de crop : (left, top, right, bottom)
CROP_BOX = (144, 21, 720, 496)

def crop_gif(input_path, output_path, crop_box=CROP_BOX):
    with Image.open(input_path) as im:
        frames = []
        durations = []

        for frame in ImageSequence.Iterator(im):
            cropped_frame = frame.crop(crop_box)
            frames.append(cropped_frame.copy())
            durations.append(frame.info.get('duration', 100))

        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=im.info.get('loop', 0),
            disposal=2
        )

def process_folder(input_dir, output_dir, suffix="_head", crop_box=CROP_BOX):
    os.makedirs(output_dir, exist_ok=True)

    for filename in os.listdir(input_dir):
        if filename.lower().endswith('.gif'):
            name, ext = os.path.splitext(filename)
            output_filename = f"{name}{suffix}{ext}"  # suffix AFTER name, before .gif
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, output_filename)
            print(f"Traitement de : {filename} → {output_filename}")
            crop_gif(input_path, output_path, crop_box)

if __name__ == "__main__":
    input_folder = "input"
    output_folder = "output"
    process_folder(input_folder, output_folder)
