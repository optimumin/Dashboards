from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required,get_jwt_identity
from flask_cors import CORS
import re
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.utils import secure_filename
from sqlalchemy import exc

import os
import  traceback

app = Flask(__name__)
app.config.from_object('config.Config')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


class User(db.Model):
    
    __tablename__ = 'users'  # Ensure this matches your actual table name

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'), nullable=False)
    role = db.relationship('Role', backref='users')


class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
class GoogleUser(db.Model):
    __tablename__='google_users'
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)


class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userid = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key referencing users table
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    
    user = db.relationship('User', backref='projects')

class ProjectAssessment(db.Model):
    __tablename__ = 'project_assessment'
    userid = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key referencing users table
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.assessment_id', ondelete='CASCADE'), primary_key=True)
    assessment_name = db.Column(db.String(255), nullable=False)
    
    project = db.relationship('Project', backref=db.backref('assessments', cascade="all, delete-orphan"))
    assessment = db.relationship('Assessment', backref=db.backref('projects', cascade="all, delete-orphan"))

class Assessment(db.Model):
    __tablename__ = 'assessments'
    assessment_id = db.Column(db.Integer, primary_key=True)
    assessment_name = db.Column(db.String(255), nullable=False)
    assessment_description = db.Column(db.Text)

    sections = db.relationship('Section', backref='assessment', lazy=True)

class Section(db.Model):
    __tablename__ = 'sections'
    section_id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.assessment_id'), nullable=False)
    section_name = db.Column(db.String(255), nullable=False)
    section_description = db.Column(db.Text)

    questions = db.relationship('Question', backref='section', lazy=True)

    

class Question(db.Model):
    __tablename__ = 'questions'
    question_id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.section_id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)

    options = db.relationship('AnswerOption', backref='question', lazy=True)
    responses = db.relationship('Response', backref='question', lazy=True)

class AnswerOption(db.Model):
    __tablename__ = 'answeroptions'
    option_id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.question_id'), nullable=False)
    option_text = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, nullable=False)

    responses = db.relationship('Response', backref='answer_option', lazy=True)

class Response(db.Model):
    __tablename__ = 'responses'  # Fixed typo

    response_id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.question_id'), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey('answeroptions.option_id'))
    response_comment = db.Column(db.Text, nullable=True)
    response_file = db.Column(db.String(255),nullable=True)
    response_file_path = db.Column(db.String, nullable=True)  # Column to store the file path
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key referencing users table


# Define the ReviewerComments model
class ReviewerComments(db.Model):
    __tablename__ = 'reviewer_comments'
    comment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    assessment_name = db.Column(db.String(255), nullable=False)
    question_id = db.Column(db.Integer, nullable=False)
    reviewer_comment = db.Column(db.Text, nullable=False)

def validate_password(password):
    return re.match(r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$', password)

def validate_username(username):
    return re.match(r'^[a-zA-Z0-9_]{3,20}$', username)

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the API!"})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role_id = data.get('role_id')
    # Validate username format
    if not validate_username(username):
        return jsonify({"msg": "Username must be between 3 and 20 characters long and contain only letters, numbers, and underscores."}), 400
    # Validate password format
    if not validate_password(password):
        return jsonify({"msg": "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."}), 400
    # Check if the username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400
    # Validate if role_id exists in the Role table
    role = Role.query.get(role_id)
    if not role:
        return jsonify({"msg": "Invalid role ID"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(username=username, password=hashed_password, role_id=role_id)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully", "id": new_user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        if user.role_id:
                print(f"User: {user.username}, Role ID: {user.role_id}")  # Debugging log

        access_token = create_access_token(identity={'username': user.username, 'role_id':user.role_id})
        return jsonify(access_token=access_token,id=user.id,role_id=user.role_id), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401



@app.route('/roles', methods=['GET'])
def get_roles():
    try:
        # Query the database for all roles
        roles = Role.query.all()
        # Transform the role objects into a list of dictionaries
        role_list = [{"role_id": role.role_id, "role_name": role.role_name} for role in roles]
        return jsonify({"roles": role_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/user', methods=['POST'])
def create_user():
    data = request.json
    google_id = data.get('google_id')
    name = data.get('name')
    email = data.get('email')
    
    if not google_id or not email:
        return jsonify({"error": "Google ID and email are required"}), 400

    try:
        user = GoogleUser.query.filter_by(google_id=google_id).first()      
        if user:
            return jsonify({"message": "User already exists"}), 200

        new_user = GoogleUser(google_id=google_id, name=name, email=email)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route('/ProjectType', methods=['GET'])
def get_assessment_types():
    assessment_name = Assessment.query.all()
    assessment_type_list = [{'assessment_id': a.assessment_id, 'assessment_name': a.assessment_name} for a in assessment_name]
    return jsonify(assessment_type_list), 200


@app.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json()

    # Extract and validate fields
    project_name = data.get('projectName')
    project_description = data.get('projectDescription')
    assessment_names = data.get('assessment_names')  # Use plural for clarity
    userid = data.get('userid')

    # Print out to debug
    print(f"Received userid: {userid}")

    if not project_name or not project_description or not assessment_names or not userid:
        return jsonify({"msg": "Project name, description, assessment types, and user id are required."}), 400

    try:
        # Check if a project with the same name already exists
        if Project.query.filter_by(name=project_name).first():
            return jsonify({"msg": "A project with this name already exists."}), 400

        # Create a new project, including the userid
        new_project = Project(userid=userid, name=project_name, description=project_description)
        db.session.add(new_project)
        db.session.flush()  # Ensure project ID is available for the next operations

        # Query all relevant assessment types at once
        assessment_type_objs = Assessment.query.filter(Assessment.assessment_name.in_(assessment_names)).all()

        # Check if all provided assessment types exist
        if len(assessment_type_objs) != len(set(assessment_names)):
            missing_types = set(assessment_names) - {at.assessment_name for at in assessment_type_objs}
            return jsonify({"msg": f"Assessment type(s) {', '.join(missing_types)} not found"}), 404

        # Associate assessment types with the project
        for assessment in assessment_type_objs:
            project_assessment = ProjectAssessment(
                project_id=new_project.id,
                assessment_id=assessment.assessment_id,
                assessment_name=assessment.assessment_name, # Corrected field name
                userid = userid
            )
            db.session.add(project_assessment)

        db.session.commit()

        # Return the new project and its associated assessments
        return jsonify({
            "msg": "Project created successfully",
            "project": {
                "id": new_project.id,
                "name": new_project.name,
                "description": new_project.description,
                "assessments": assessment_names
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        # Log the exception for debugging (use a logger in a real app)
        print(f"Error creating project: {str(e)}")
        return jsonify({"msg": f"An error occurred: {str(e)}"}), 500

@app.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    current_user = get_jwt_identity()
    print(f"Current User: {current_user}")  # Debugging: log current user information
    
    user = User.query.filter_by(username=current_user['username']).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    if user.role_id == 1: 
                projects = Project.query.filter_by(userid =user.id).all()#   Submitter role
    elif user.role_id == 2: 
                projects = Project.query.all() #  Auditor role
    else:
        return jsonify({"msg": "Unauthorized"}), 403

    if not projects:
        return jsonify({"msg": "No projects found"}), 404

    # Serialize project data
    project_list = [
        {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "assessment_name": [a.assessment.assessment_name for a in project.assessments]
        }
        for project in projects
    ]

    return jsonify(project_list), 200

@app.route('/projects/<int:userid>/assessments', methods=['GET'])
def get_assessments(userid):
    try:
        # Query to filter assessments by project_id
        assessments = db.session.query(Assessment.assessment_id, Assessment.assessment_name).\
            join(ProjectAssessment, ProjectAssessment.assessment_id == Assessment.assessment_id).\
            filter(ProjectAssessment.userid == userid).all()
        
        # Create a list of dictionaries containing assessment names
        results = [{'assessment_id': assessment[0], 'assessment_name': assessment[1]} for assessment in assessments]
        
        return jsonify(results), 200

    except Exception as e:
        return jsonify({"message": "An error occurred while fetching assessments.", "error": str(e)}), 500


#Assessment data (section,qn,option) getting from db
@app.route('/api/assessments/<assessment_name>', methods=['GET'])
def get_assessment(assessment_name):
    try:
        # Strip whitespace from the assessment name
        assessment_name = assessment_name.strip()

        # Fetch the assessment with joined loading for sections and questions
        assessment = Assessment.query.options(
            joinedload(Assessment.sections).joinedload(Section.questions)
        ).filter_by(assessment_name=assessment_name).one()

        # Prepare the data to return as JSON
        data = {
            'Assessment Name': assessment.assessment_name,
            'Assessment Description': assessment.assessment_description,
            'Sections': []
        }

        # Loop through the sections and questions to structure the response
        for section in assessment.sections:
            section_data = {
                'Section_name': section.section_name,
                'Section_description': section.section_description,
                'Questions': []
            }

            for question in section.questions:
                # Fetch all answer options for the question
                options = AnswerOption.query.filter_by(question_id=question.question_id).all()
                question_data = {
                    'question_id': question.question_id,  # Include question_id here
                    'question_text': question.question_text,
                    'options': [{'option_id': option.option_id, 'option_text': option.option_text} for option in options]
                }
                section_data['Questions'].append(question_data)

            data['Sections'].append(section_data)

        return jsonify(data), 200

    # Handle case where no assessment is found
    except NoResultFound:
        return jsonify({'error': 'Assessment not found'}), 404

    # Catch any other unexpected errors
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the error for debugging
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


@app.after_request
def apply_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    return response

# Set file upload directory
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024  # 1000MB limit
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Create uploads folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Submitting data
@app.route('/api/responses', methods=['POST'])
def submit_assessment():
    try:
        # Debugging logs
        print("Form Data:", request.form)  
        print("File Data:", request.files)  

        # Extract and validate responses
        grouped_responses = {}
        user_id = None

        for key, value in request.form.items():
            if key.startswith("responses["):
                # Extract index and field name
                index = key.split('[')[1].split(']')[0]
                field = key.split('[')[2].split(']')[0]

                # Initialize grouped responses for the index
                if index not in grouped_responses:
                    grouped_responses[index] = {}

                # Assign the value to the appropriate field
                grouped_responses[index][field] = value

                # Capture and validate user_id
                if field == "user_id":
                    if user_id and user_id != value:
                        return jsonify({"error": "All responses must belong to the same user"}), 400
                    user_id = value

        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Process responses and handle file uploads
        for index, response_data in grouped_responses.items():
            question_id = response_data.get("question_id")
            option_id = response_data.get("option_id")
            response_comment = response_data.get("response_comment")

            # Validate required fields
            if not question_id or not option_id:
                return jsonify({"error": f"Missing required data for response {index}"}), 400

            # Handle file uploads
            file = request.files.get(f'responses[{index}][response_file]')
            response_file_name = None
            file_path = None

            if file and file.filename:
                if allowed_file(file.filename):
                    response_file_name = secure_filename(file.filename)
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], response_file_name)
                    file.save(file_path)
                    print(f"File saved: {file_path}")

            # Check if a response already exists
            existing_response = Response.query.filter_by(
                question_id=question_id, user_id=user_id
            ).first()

            if existing_response:
                # Update existing response
                existing_response.option_id = option_id
                existing_response.response_comment = response_comment
                if response_file_name:
                    existing_response.response_file = response_file_name
                    existing_response.response_file_path = file_path
            else:
                # Create a new response
                new_response = Response(
                    question_id=question_id,
                    option_id=option_id,
                    response_comment=response_comment,
                    response_file=response_file_name,
                    response_file_path=file_path,
                    user_id=user_id
                )
                db.session.add(new_response)

        # Commit changes to the database
        db.session.commit()
        return jsonify({"message": "Assessment submitted successfully"}), 200

    except Exception as e:
        # Rollback and log errors
        db.session.rollback()
        print("Error occurred:", str(e))
        return jsonify({"error": "Internal server error"}), 500

#ReviewAssessmentpage
@app.route('/api/get_submitted_assessment_data/<string:assessment_name>/<int:user_id>', methods=['GET'])
def get_submitted_assessment_data(assessment_name, user_id):
    try:
        print(f"Received assessment_name: {assessment_name}, user_id: {user_id}")  # Debugging log

        project = Project.query.join(ProjectAssessment).join(Assessment).filter(
            Project.userid == user_id,
            Assessment.assessment_name == assessment_name
        ).first()

        if not project:
            return jsonify({"error": "Project or Assessment not found for this user"}), 404

        submitted_data = []
        for section in project.assessments[0].assessment.sections:
            section_data = {
                "Section_Name": section.section_name,
                "Questions": []
            }

            for question in section.questions:
                # Query for the response for the specific question and user
                response = Response.query.filter_by(question_id=question.question_id, user_id=user_id).first()

                # Prepare the question data
                question_data = {
                    "question_id": question.question_id,
                    "question_text": question.question_text,
                    "selected_option_text": None,  # Initialize as None
                    "response_comment": "No comment",  # Default comment if no response
                    "response_file_url": None  # Default file URL if no response
                }

                # If a response exists, populate the data
                if response:
                    question_data["selected_option_text"] = response.answer_option.option_text if response.answer_option else "No response"
                    question_data["response_comment"] = response.response_comment if response.response_comment else "No comment"
                    question_data["response_file_url"] = response.response_file if response.response_file else None

                # Append question data to section data
                section_data["Questions"].append(question_data)

            submitted_data.append(section_data)

        return jsonify(submitted_data), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error for debugging
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500



#reviewpage 
#reviewpage   this my old code 
@app.route('/api/assessments/project/<int:userid>', methods=['GET'])
def get_assessments_by_project(userid):
    assessments = db.session.query(
        Assessment.assessment_id,
        Assessment.assessment_name
    ).join(
        ProjectAssessment, ProjectAssessment.assessment_id == Assessment.assessment_id
    ).filter(
        ProjectAssessment.userid == userid
    ).all()
    
    return jsonify([{
        'assessment_id': assessment.assessment_id,
        'assessment_name': assessment.assessment_name,
    } for assessment in assessments])



#..

@app.route('/api/responses/<int:user_id>', methods=['GET'])
def get_user_responses(user_id):
    try:
        # Optionally, you can log the assessment_name to check its value
        print(f"User ID: {user_id}")

        # Query the database for responses by user_id and assessment_name
        responses = Response.query.filter_by(user_id=user_id).all()

        if not responses:
            return jsonify({"message": "No responses found for the user"}), 404

        # Prepare the response data
        response_data = []
        for response in responses:
            response_data.append({
                'question_id': response.question_id,
                'option_id': response.option_id,
                'response_comment': response.response_comment,
                'response_file': response.response_file,  # Include file name if needed
                'response_file_path': response.response_file_path  # Include file path if needed
            })

        # Return the responses as JSON
        return jsonify(response_data), 200

    except Exception as e:
        print("Error occurred while fetching responses:", str(e))
        return jsonify({"error": "Failed to retrieve responses", "details": str(e)}), 500

@app.route('/api/responses/update', methods=['PUT'])
def update_responses():
    data = request.form
    for key, value in data.items():
        question_id = key.split('[')[1].split(']')[0]
        response = Response.query.filter_by(question_id=question_id).first()
        if response:
            response.option_id = data[f'responses[{question_id}][option_id]']
            response.response_comment = data[f'responses[{question_id}][response_comment]']
            db.session.commit()
    return jsonify({'message': 'Responses updated successfully!'}), 200


# API endpoint to handle reviewer comment submission
@app.route('/api/submit_reviewer_comments', methods=['POST'])
def submit_reviewer_comments():
    try:
        # Get the list of comments from the request
        data = request.json  # Expecting an array of comment objects

        # Validate input
        if not data:
            return jsonify({'error': 'Missing required data'}), 400

        # Save each comment to the database
        for comment in data:
            user_id = comment.get('user_id')
            assessment_name = comment.get('assessment_name')
            question_id = comment.get('question_id')
            reviewer_comment = comment.get('reviewer_comment')

            # Validate the individual comment data
            if not user_id or not assessment_name or not question_id or not reviewer_comment:
                return jsonify({'error': 'Invalid comment data'}), 400

            # Create a new ReviewerComments object and save to database
            new_comment = ReviewerComments(
                user_id=user_id,
                assessment_name=assessment_name,
                question_id=question_id,
                reviewer_comment=reviewer_comment
            )
            db.session.add(new_comment)

        # Commit the transaction
        db.session.commit()

        return jsonify({'message': 'Reviewer comments submitted successfully'}), 201

    except Exception as e:
        print(f"Error: {e}")  # Log the error for debugging
        return jsonify({'error': 'An error occurred while submitting comments'}), 500
#getting project to view the dashboard     
@app.route('/projects/<int:user_id>', methods=['GET'])
def get_user_projects(user_id):
    try:
        # Query the database to fetch projects for the given user_id
        projects = Project.query.filter_by(userid=user_id).all()  # Changed 'user_id' to 'userid'

        if not projects:
            return jsonify({"message": "No projects found for this user."}), 404

        # Format the response to send project names and IDs to the frontend
        project_list = [{"project_id": project.id, "project_name": project.name} for project in projects]

        return jsonify(project_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




#reviewe comments getting to user
@app.route('/api/get_reviewer_comments', methods=['GET'])
def get_reviewer_comments():
    user_id = request.args.get('user_id')
    assessment_name = request.args.get('assessment_name')

    if not user_id or not assessment_name:
        return jsonify({'error': 'Missing parameters'}), 400

    # Query reviewer comments for this assessment and user
    comments = ReviewerComments.query.filter_by(
        user_id=user_id, 
        assessment_name=assessment_name
    ).all()

    if not comments:
        return jsonify([])  # Return an empty array if no comments are found

    # Organize data by question_id for easier access on the frontend
    comments_by_question = []
    for comment in comments:
        comments_by_question.append({
            'question_id': comment.question_id,
            'reviewer_comment': comment.reviewer_comment
        })

    return jsonify(comments_by_question)



if __name__ == '__main__':
    app.run(debug=True)




