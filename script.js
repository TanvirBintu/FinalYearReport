// Fetch the JSON data from an external file
fetch('data.json')
  .then(response => response.json())
  .then(examData => {
    const tbody = document.querySelector('tbody');
    let totalStudents = 0, totalAppeared = 0, totalPassed = 0, totalFailed = 0, totalAbsent = 0;
    let totalAPlus = 0, totalA = 0, totalAMinus = 0, totalB = 0, totalC = 0, totalD = 0;

    const sectionsMap = {};  // To track data per section
    const groupCounts = {};  // To track the number of sections per group for rowspan
    const versionCounts = {}; // To track the number of sections per version for rowspan

    // Iterate through each student in the JSON data
    examData.students.forEach(student => {
      const section = student.section;
      const group = student.group;
      const version = student.version;

      // Initialize section data if it doesn't exist yet
      if (!sectionsMap[section]) {
        sectionsMap[section] = {
          group: group,
          version: version,
          students: 0,
          appeared: 0,
          passed: 0,
          failed: 0,
          absent: 0,
          "A+": 0,
          "A": 0,
          "A-": 0,
          "B": 0,
          "C": 0,
          "D": 0
        };

        // Count how many sections belong to this group for rowspan
        if (!groupCounts[group]) {
          groupCounts[group] = 0;
        }
        groupCounts[group]++;

        // Count how many sections belong to this version for rowspan
        if (!versionCounts[version]) {
          versionCounts[version] = 0;
        }
        versionCounts[version]++;
      }

      sectionsMap[section].students += 1;
      sectionsMap[section].appeared += 1;  // Assuming all students appear for the exam; adjust if otherwise

      // Count grades and GPA
      const finalGrade = student.finalGrade;
      if (finalGrade === 'A+') sectionsMap[section]["A+"] += 1;
      else if (finalGrade === 'A') sectionsMap[section]["A"] += 1;
      else if (finalGrade === 'A-') sectionsMap[section]["A-"] += 1;
      else if (finalGrade === 'B') sectionsMap[section]["B"] += 1;
      else if (finalGrade === 'C') sectionsMap[section]["C"] += 1;
      else if (finalGrade === 'D') sectionsMap[section]["D"] += 1;

      if (student.finalGrade !== 'F') {
        sectionsMap[section].passed += 1;
      } else {
        sectionsMap[section].failed += 1;
      }

      // Update totals
      totalStudents += 1;
      totalAppeared += 1;
      if (student.finalGrade !== 'F') totalPassed += 1;
      else totalFailed += 1;
    });

    // Track which groups and versions we've already added to avoid multiple insertions
    const processedGroups = {};
    const processedVersions = {};

    // Generate rows for each section
    Object.keys(sectionsMap).forEach(sectionKey => {
      const section = sectionsMap[sectionKey];
      const row = document.createElement('tr');

      // Add group cell with rowspan only for the first occurrence of each group
      if (!processedGroups[section.group]) {
        const groupCell = document.createElement('td');
        groupCell.setAttribute('rowspan', groupCounts[section.group]); // Apply rowspan based on section count for this group
        groupCell.textContent = section.group;
        row.appendChild(groupCell);

        // Mark the group as processed
        processedGroups[section.group] = true;
      }

      // Add version cell with rowspan only for the first occurrence of each version
      if (!processedVersions[section.version]) {
        const versionCell = document.createElement('td');
        versionCell.setAttribute('rowspan', versionCounts[section.version]); // Apply rowspan based on section count for this version
        versionCell.textContent = section.version;
        row.appendChild(versionCell);

        // Mark the version as processed
        processedVersions[section.version] = true;
      }

      // Add the rest of the row data
      row.innerHTML += `
        <td>${sectionKey}</td>
        <td>${section.students}</td>
        <td>${section.appeared}</td>
        <td>${section["A+"]}</td>
        <td>${section.A}</td>
        <td>${section["A-"]}</td>
        <td>${section.B}</td>
        <td>${section.C}</td>
        <td>${section.D}</td>
        <td>${section.passed}</td>
        <td>${section.failed}</td>
        <td>${section.absent}</td>
        <td>${((section.passed / section.appeared) * 100).toFixed(2)}%</td>
      `;
      tbody.appendChild(row);
    });

    // Append the total row
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
      <td colspan="3">Total</td>
      <td>${totalStudents}</td>
      <td>${totalAppeared}</td>
      <td>${totalAPlus}</td>
      <td>${totalA}</td>
      <td>${totalAMinus}</td>
      <td>${totalB}</td>
      <td>${totalC}</td>
      <td>${totalD}</td>
      <td>${totalPassed}</td>
      <td>${totalFailed}</td>
      <td>${totalAbsent}</td>
      <td>${((totalPassed / totalAppeared) * 100).toFixed(2)}%</td>
    `;
    tbody.appendChild(totalRow);
  })
  .catch(error => console.error('Error fetching data:', error));
