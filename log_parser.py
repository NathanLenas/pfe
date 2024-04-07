import re
import pandas as pd
import matplotlib.pyplot as plt

# Read logs from file
with open('./api/place_code/log/place.log') as f:
    logs = f.readlines()
    print("got " + str(len(logs)) + " lines of logs")

timing_regex = re.compile(r"TIMING: Wall:\s*(\d+\.\d+)ms \| CPU:\s*(\d+\.\d+)ms \| app.app.main.draw_on_board", re.IGNORECASE)
websocket_regex = re.compile(r"Websocket send:\s*(\d+\.\d+)ms, (\d+) users", re.IGNORECASE)
get_board_bitmap_regex = re.compile(r"TIMING: Wall:\s*(\d+\.\d+)ms \| CPU:\s*(\d+\.\d+)ms \| app.app.main.get_board_bitmap", re.IGNORECASE)

# Data storage
data_points = []

# Parse logs
for log in logs:
    timing_match = timing_regex.search(log)
    websocket_match = websocket_regex.search(log)
    get_board_bitmap_match = get_board_bitmap_regex.search(log)
    
    timing = None # Initialize timing to None
    
    if timing_match:
        wall_time, cpu_time = timing_match.groups()
        timing = float(wall_time) + float(cpu_time)
        if timing is not None:
            data_points.append({"timing": timing, "operation": "draw_on_board"})
    
    if websocket_match:
        websocket_time, num_users = websocket_match.groups()
        num_users = int(num_users) // 2
        if timing is not None: 
            data_points.append({"timing": timing, "num_users": num_users, "operation": "draw_on_board"})
    
    if get_board_bitmap_match:
        wall_time, cpu_time = get_board_bitmap_match.groups()
        timing = float(wall_time) + float(cpu_time)
        if timing is not None: 
            data_points.append({"timing": timing, "operation": "get_board_bitmap"})

# Convert data_points to a pandas DataFrame
df = pd.DataFrame(data_points)

# Calculate average timing for each operation
average_timing_per_operation = df.groupby('operation')['timing'].mean()

# Calculate standard deviation for each operation
std_dev_per_operation = df.groupby('operation')['timing'].std()

print("Average timing per operation")
print(average_timing_per_operation)

print("Standard deviation per operation")
print(std_dev_per_operation)

# Plotting
plt.figure(figsize=(10, 5))

# Plot average timing for each operation with standard deviation as error bars
average_timing_per_operation.plot(kind='bar', yerr=std_dev_per_operation, capsize=5, title="Average Timing per Operation with Standard Deviation", xlabel="Operation", ylabel="Average Timing (ms)")

plt.tight_layout()
plt.show()
