import shutil
import os
import sys
import io
from helpers import *


sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

class FileUtils:
    def __init__(self, src_folder, dst_folder):
        """Initialize source and destination folders."""
        self.src_folder = src_folder
        self.dst_folder = dst_folder


    def copy_entire_folder(self):
        """Copy the entire folder, including subdirectories and files."""
        try:
            shutil.copytree(self.src_folder, self.dst_folder, dirs_exist_ok=True)
            print(f"Folder copied successfully: {self.src_folder} to  {self.dst_folder}")
        except Exception as e:
            print(f"Error copying folder: {str(e)}")

    def copy_only_files(self):
        """Copy only files (not subdirectories) from source to destination."""
        try:
            os.makedirs(self.dst_folder, exist_ok=True)  # Ensure destination exists

            for file_name in os.listdir(self.src_folder):
                src_file = os.path.join(self.src_folder, file_name)
                dst_file = os.path.join(self.dst_folder, file_name)

                if os.path.isfile(src_file):  # Only copy files, skip directories
                    shutil.copy2(src_file, dst_file)

            print(f"Files copied successfully: {self.src_folder} ➜ {self.dst_folder}")

        except Exception as e:
            print(f"Error copying files: {str(e)}")

# src = "ranking"
# dst = "E:\\Work\saTennisIndia\\Repo\\web\\tennisindialive\\public\\ranking"
#
# folder_copier = FileUtils(src, dst)
# folder_copier.copy_entire_folder()  # To copy entire folder
