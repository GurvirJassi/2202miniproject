/**
 * Define the Course and Assignment concepts using the class notations
 */

class Assignment {

    constructor(title, dueDate) {
        
        this.title = title;
        this.dueDate = dueDate;
    }

    // printing assignment method
    printAssignment() {
        console.log('   Title: ' + this.title + ' | Due Date: ' + this.dueDate);
    }

}

class Course {

    constructor(courseName, instructor, creditHours, assignments) {

        // assigning properties
        this.courseName = courseName;
        this.instructor = instructor;
        this.creditHours = creditHours;
        this.assignments = assignments;
    }

    // top level printing method
    courseInfo() {

        console.log('Course: ' + this.courseName +
                    ' | Instructor: ' + this.instructor +
                    ' | Credit Hours: ' + this.creditHours);   

        console.log('Assignments >>>');

        // loop to print all assignments for course
        for (let a of this.assignments){
            a.printAssignment();
        }
    }
}
// create the objects using the classes

// creating the assignment objects
let a1 = new Assignment('Project Proposal', 'Jan 15');
let a2 = new Assignment('Midterm Report', 'Feb 20');
let a3 = new Assignment('Final Report', 'Mar 30');
let a4 = new Assignment('Presentation', 'Apr 10');

// course objects using class method
let c1 = new Course('Software Engineering', 'Dr. Pepper', 3, [a1, a2]);
let c2 = new Course('Data Science', 'Dr. Evil', 6, [a3, a4]);

c1.courseInfo();
c2.courseInfo();
