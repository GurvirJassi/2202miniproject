
// 1. Observer Class
class Observer {

    constructor() {
        // No specific properties needed, so kept empty
    }

    // Notifies the observer of a status change.

    notify(studentName, assignmentName, status) {
        // Formatting output based on the specific status to match example output
        let message = "";
        
        switch (status.toLowerCase()) {
            case 'released':
                message = `${studentName}, ${assignmentName} has been released.`;
                break;
            case 'working':
                message = `${studentName} is working on ${assignmentName}.`;
                break;
            case 'submitted':
                message = `${studentName} has submitted ${assignmentName}.`;
                break;
            case 'pass':
                message = `${studentName} has passed ${assignmentName}`;
                break;
            case 'fail':
                message = `${studentName} has failed ${assignmentName}`;
                break;
            case 'final reminder':
                message = `${studentName}, Final Reminder for ${assignmentName}.`;
                break;
            default:
                message = `${studentName}, ${assignmentName} status: ${status}`;
        }
        
        console.log(`Observer → ${message}`);
    }
}


// 2. Assignment Class


class Assignment {
    // Private grade field
    #grade;

    constructor(name, status = 'released') {
        this.assignmentName = name;
        this.status = status;
        this.#grade = null;
    }

    // Sets the grade and updates status to 'pass' or 'fail'.

    setGrade(score) {
        this.#grade = score;
        if (score > 50) {
            this.status = 'pass';
        } else {
            this.status = 'fail';
        }
    }

    // Getter method for grade
    getScore() {
        return this.#grade;
    }
}


// 3. Student Class


class Student {
    constructor(fullName, email, observer) {
        this.fullName = fullName;
        this.email = email;
        this.observer = observer;
        this.assignmentStatuses = []; // Array of Assignment objects
        this.overallGrade = 0;
    }

    setFullName(name) {
        this.fullName = name;
    }

    setEmail(email) {
        this.email = email;
    }

    // Method to update assignment status
    updateAssignmentStatus(name, grade = null) {
        let assignment = this.assignmentStatuses.find(a => a.assignmentName === name);

        // If assignment does not exist, create a new one with default released status
        if (!assignment) {
            assignment = new Assignment(name, 'released');
            this.assignmentStatuses.push(assignment);
            this.observer.notify(this.fullName, name, 'released');
        }

        // If a grade is passed, set it (which updates status to pass/fail)
        if (grade !== null) {
            assignment.setGrade(grade);
            this.observer.notify(this.fullName, name, assignment.status);
        }
    }


    // Retrieves status of an specific assignment identified by its name
    getAssignmentStatus(name) {
        const assignment = this.assignmentStatuses.find(a => a.assignmentName === name);
        // Case for if assignment not found
        if (!assignment) {
            return "Hasn't been assigned";
        }
        return assignment.status;
    }

    // Calculates and returns overall grade as average of all graded assignments
    getGrade() {
        const gradedAssignments = this.assignmentStatuses.filter(a => a.getScore() !== null);
        
        if (gradedAssignments.length === 0) return 0;

        const total = gradedAssignments.reduce((sum, a) => sum + a.getScore(), 0);
        this.overallGrade = total / gradedAssignments.length;
        return this.overallGrade;
    }

    // Start working and submit
    async startWorking(assignmentName) {
        const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
        if (!assignment) {
            console.error(`Error: ${this.fullName} cannot start unknown assignment ${assignmentName}`);
            return;
        }

        // Update status to working
        assignment.status = 'working';
        this.observer.notify(this.fullName, assignmentName, 'working');

        // Wait 500ms
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if status is  'working'. 
        // If a reminder was sent, status might be 'final reminder' or already 'submitted'.

        if (assignment.status === 'working') {
             this.submitAssignment(assignmentName);
        }
    }

    // Submits the assignment and triggers grading
    async submitAssignment(assignmentName) {
        const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
        
        // Guard clause: If already graded (pass/fail) or submitted, don't re-submit
        if (!assignment || assignment.status === 'submitted' || assignment.status === 'pass' || assignment.status === 'fail') {
            return;
        }

        // Change status to submitted
        assignment.status = 'submitted';
        this.observer.notify(this.fullName, assignmentName, 'submitted');

        // Simulate grading delay
        setTimeout(() => {
            // Generate random grade 0-100
            const randomGrade = Math.floor(Math.random() * 101);
            this.updateAssignmentStatus(assignmentName, randomGrade);
        }, 500);
    }
    
    // Helper to handle forced submission via reminder

    forceSubmitByReminder(assignmentName) {
         const assignment = this.assignmentStatuses.find(a => a.assignmentName === assignmentName);
         if(assignment && (assignment.status !== 'pass' && assignment.status !== 'fail' && assignment.status !== 'submitted')) {
             assignment.status = 'final reminder';
             this.observer.notify(this.fullName, assignmentName, 'final reminder');
             this.submitAssignment(assignmentName);
         }
    }
}


// 4. ClassList Class


class ClassList {
    constructor(observer) {
        this.students = []; // Array of Student objects
        this.observer = observer; // Kept for reference if needed, though students have their own ref
    }

    addStudent(student) {
        this.students.push(student);
        console.log(`${student.fullName} has been added to the classlist.`);
    }

    removeStudent(studentName) {
        this.students = this.students.filter(s => s.fullName !== studentName);
    }

    findStudentByName(name) {
        return this.students.find(s => s.fullName === name);
    }

    // Finds students who haven't submitted a specific assignment,
    // Or any released assignment if no name is provided.
    findOutstandingAssignments(assignmentName) {
        let result = [];

        if (assignmentName) {
            // Check specific assignment
            result = this.students
                .filter(student => {
                    const status = student.getAssignmentStatus(assignmentName);
                    // Outstanding if it exists (not "Hasn't been assigned") 
                    // and is NOT submitted, pass, or fail.
                    return status !== "Hasn't been assigned" && 
                           status !== 'submitted' && 
                           status !== 'pass' && 
                           status !== 'fail';
                })
                .map(s => s.fullName);
        } else {
            // Check ANY assignment that is released/working but not submitted/graded
            result = this.students
                .filter(student => {
                    return student.assignmentStatuses.some(a => 
                        a.status === 'released' || a.status === 'working' || a.status === 'final reminder'
                    );
                })
                .map(s => s.fullName);
        }
        return result;
    }

    // Releases assignments to all students in parallel

    async releaseAssignmentsParallel(assignmentNames) {
        const promises = [];

        this.students.forEach(student => {
            assignmentNames.forEach(name => {
                // We wrap the update in a promise to simulate/ensure async handling compatible with Promise.all
                // update itself is synchronous but Promise.all requires promises
                promises.push(new Promise((resolve) => {
                    student.updateAssignmentStatus(name);
                    resolve();
                }));
            });
        });

        await Promise.all(promises);
    }

    // Sends reminder to students who haven't submitted/passed/failed a specific assignment
    // Submits on their behalf
    sendReminder(assignmentName) {
        // Filter students who have the assignment but haven't submitted/passed/failed
        const targetStudents = this.students.filter(student => {
            const status = student.getAssignmentStatus(assignmentName);
            return status === 'released' || status === 'working';
        });

        targetStudents.forEach(student => {
            student.forceSubmitByReminder(assignmentName);
        });
    }
}


// 5. Sample Simulation Code


async function runSimulation() {
    console.log("=== Starting Simulation ===\n");

    const observer = new Observer();
    const classList = new ClassList(observer);

    const s1 = new Student("Dexter Morgan", "dmorg@miamimetro.com", observer);
    const s2 = new Student("Eric Cartman", "ecartman@southpark.com", observer);

    classList.addStudent(s1);
    classList.addStudent(s2);

    console.log("\n--- Releasing Assignments ---");
    // Release assignments and wait for them to be released
    await classList.releaseAssignmentsParallel(["A1", "A2"]);

    console.log("\n--- Students Start Working ---");
    // s1 starts A1, s2 starts A2
    s1.startWorking("A1");
    s2.startWorking("A2");

    // Send a reminder for A1 after 200ms
    // This should catch Alice while she is "working" on A1 and force submit.
    // Bob is working on A2, so he shouldn't be affected by A1 reminder.
    setTimeout(() => {
        console.log("\n--- Sending Reminder for A1 ---");
        classList.sendReminder("A1");
    }, 200);

    // To ensure the script doesn't end before async operations complete in a node environment:
    // (In a browser console this isn't strictly necessary, but good for standalone execution)
    setTimeout(() => {
        console.log("\n=== Simulation Complete (Check async grades above) ===");
    }, 2000);
}

// Execute
runSimulation();