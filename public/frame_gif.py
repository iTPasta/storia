from PIL import Image, ImageFile, ImageSequence
import os

ImageFile.LOAD_TRUNCATED_IMAGES = True

# === CONFIGURATION ===
robot_path = "robot.png"      # Ton image de robot avec visage vide
gifs_folder = "gifs/"         # Dossier contenant les gifs d'entrée
output_folder = "output/"     # Dossier de sortie
face_box = (226, 168, 640, 404)  # (left, top, right, bottom)

# Crée le dossier output si besoin
os.makedirs(output_folder, exist_ok=True)

def process_gif_with_robot(robot_path, gif_path, face_box, output_path):
    robot_base = Image.open(robot_path).convert("RGBA")
    gif = Image.open(gif_path)

    face_width = face_box[2] - face_box[0]
    face_height = face_box[3] - face_box[1]

    frames = []
    for frame in ImageSequence.Iterator(gif):
        frame = frame.convert("RGBA")
        resized_frame = frame.resize((face_width, face_height))

        # Crée un fond vide
        frame_base = Image.new("RGBA", robot_base.size)

        # Colle le visage animé d'abord
        frame_base.paste(resized_frame, face_box[:2], resized_frame)

        # Colle le robot par-dessus
        frame_base.alpha_composite(robot_base)

        frames.append(frame_base)

    # On répète la dernière frame pour "geler" l'animation
    for _ in range(10):
        frames.append(frames[-1])

    # Sauvegarde le résultat
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=gif.info.get("duration", 100),
        loop=1,
        disposal=2
    )

    print(f"✅ {os.path.basename(output_path)} généré.")

def main():
    for gif_file in os.listdir(gifs_folder):
        if gif_file.lower().endswith(".gif"):
            gif_path = os.path.join(gifs_folder, gif_file)
            base_name = os.path.splitext(gif_file)[0]
            output_path = os.path.join(output_folder, f"{base_name}_framed.gif")

            try:
                process_gif_with_robot(robot_path, gif_path, face_box, output_path)
            except Exception as e:
                print(f"⚠️ Erreur avec {gif_file} : {e}")

main()
