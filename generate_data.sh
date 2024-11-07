#!/bin/bash

# Output file
output_file="output.json"


# Initialize JSON structure
echo '{"results":[' > "$output_file"

# Loop to generate JSON entries from 0 to 1,000,000
for i in $(seq 0 1000000); do
  givenName=aaaaaaaaaaaaaaaa
  familyName=bbbbbbbbbbbbbbbbbbb

  # Format each JSON entry
  if [ "$i" -lt 1000000 ]; then
    echo "{\"id\":$i, \"givenName\":\"$givenName\", \"familyName\":\"$familyName\"}," >> "$output_file"
  else
    echo "{\"id\":$i, \"givenName\":\"$givenName\", \"familyName\":\"$familyName\"}" >> "$output_file"
  fi
done

# Close JSON array and object
echo ']}' >> "$output_file"

echo "JSON file generated at $output_file"
