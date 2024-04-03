import re
import pandas as pd
import matplotlib.pyplot as plt

# Read logs from file
with open('/home/nat/Documents/cours/ing3/place_pfe/api/place_code/log/place.log') as f:
    logs = f.readlines()

# Regular expressions to extract data
timing_regex = re.compile(r"TIMING: Wall:    (\d+\.\d+)ms \| CPU:    (\d+\.\d+)ms \| app.app.main.draw_on_board", re.IGNORECASE)
websocket_regex = re.compile(r"Websocket send: (\d+\.\d+)ms, (\d+) users", re.IGNORECASE)

# Data storage
data_points = []

# Parse logs
for log in logs:
    timing_match = timing_regex.search(log)
    websocket_match = websocket_regex.search(log)
    
    if timing_match:
        wall_time, cpu_time = timing_match.groups()
        # Store the total timing (e.g., Wall time)
        timing = float(wall_time) + float(cpu_time)
    
    if websocket_match:
        websocket_time, num_users = websocket_match.groups()
        # Store the number of users for each WebSocket send operation
        num_users = int(num_users) // 2
        # Combine timing and number of users into a single data point
        data_points.append({"timing": timing,  "num_users": num_users})

# Convert data_points to a pandas DataFrame
df = pd.DataFrame(data_points)

# Group by number of users and calculate the average timing
average_timing = df.groupby('num_users')['timing'].mean()

# Plotting
plt.figure(figsize=(10, 5))

# Plot average timing against the number of users
average_timing.plot(kind='line', x='num_users', y='timing', title="Average Timing vs. Number of Users", xlabel="Number of Users", ylabel="Average Timing (ms)")

plt.tight_layout()
plt.show()
