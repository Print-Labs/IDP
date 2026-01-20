import subprocess
import re
import os
from typing import Tuple, Optional

PRUSA_SLICER_PATH = os.getenv("PRUSA_SLICER_PATH", "prusa-slicer-console")

def run_slicer(file_path: str, output_gcode_path: str) -> Tuple[Optional[float], Optional[int]]:
    """
    Runs the slicer on the given file.
    Returns a tuple of (weight_grams, print_time_seconds).
    """
    command = [
        PRUSA_SLICER_PATH,
        "--export-gcode",
        "--output", output_gcode_path,
        file_path
    ]
    
    try:
        # Run the slicer
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        stdout = result.stdout
        
        # Parse output for weight and time
        # Example output patterns (vary by slicer version):
        # "Filament used: 1.23m (10.5g)"
        # "Estimated printing time: 1h 30m 10s"
        
        weight_match = re.search(r"Filament used:.*\((\d+\.?\d*)g\)", stdout)
        time_match = re.search(r"Estimated printing time: (.*)", stdout)
        
        weight_grams = float(weight_match.group(1)) if weight_match else None
        
        print_time_seconds = 0
        if time_match:
            time_str = time_match.group(1).strip()
            # Parse time string "1h 30m 10s" or "30m 10s" etc.
            # Simplified parser:
            parts = time_str.split(' ')
            for part in parts:
                if 'd' in part:
                    print_time_seconds += int(part.replace('d', '')) * 86400
                elif 'h' in part:
                    print_time_seconds += int(part.replace('h', '')) * 3600
                elif 'm' in part:
                    print_time_seconds += int(part.replace('m', '')) * 60
                elif 's' in part:
                    print_time_seconds += int(part.replace('s', ''))
                    
        return weight_grams, print_time_seconds
        
    except subprocess.CalledProcessError as e:
        print(f"Slicing failed: {e.stderr}")
        return None, None
    except Exception as e:
        print(f"Error parsing slicer output: {e}")
        return None, None
