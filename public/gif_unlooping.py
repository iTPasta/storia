from PIL import Image, ImageSequence
import os

# === CONFIGURATION ===
input_folder = "input/"
output_folder = "output/"

# Crée le dossier de sortie s’il n’existe pas
os.makedirs(output_folder, exist_ok=True)

def fix_gif_loop(input_path, output_path):
    try:
        gif = Image.open(input_path)

        frames = [frame.copy().convert("RGBA") for frame in ImageSequence.Iterator(gif)]
        durations = []
        for frame in ImageSequence.Iterator(gif):
            durations.append(frame.info.get("duration", 100))

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=1,  # <== ici on désactive la boucle infinie
            disposal=2
        )
        print(f"✅ {os.path.basename(output_path)} corrigé.")
    except Exception as e:
        print(f"❌ Erreur avec {input_path} : {e}")

def main():
    for file_name in os.listdir(input_folder):
        if file_name.lower().endswith(".gif"):
            input_path = os.path.join(input_folder, file_name)
            output_path = os.path.join(output_folder, file_name)
            fix_gif_loop(input_path, output_path)

if __name__ == "__main__":
    main()

