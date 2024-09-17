from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_cors import CORS
import re
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.utils import secure_filename
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

class GoogleUser(db.Model):
    __tablename__='google_users'
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    assessment_types = db.Column(db.String(200), nullable=False)
    
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
    response_comment = db.Column(db.Text)
    response_file = db.Column(db.String(255))
    response_file_path = db.Column(db.String)  # Column to store the file path



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

    if not validate_username(username):
        return jsonify({"msg": "Username must be between 3 and 20 characters long and contain only letters, numbers, and underscores."}), 400

    if not validate_password(password):
        return jsonify({"msg": "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity={'username': user.username})
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Invalid credentials"}), 401

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

@app.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    project_name = data.get('projectName')
    project_description = data.get('projectDescription')
    selected_assessment_types = data.get('selectedAssessmentTypes')

    # Ensure selectedAssessmentTypes is a list
    if not isinstance(selected_assessment_types, list):
        return jsonify({"msg": "Assessment types should be a list"}), 400

    # Join the list into a comma-separated string
    assessment_types = ','.join(selected_assessment_types)

    if not all([project_name, project_description, assessment_types]):
        return jsonify({"msg": "All fields are required"}), 400

    try:
        new_project = Project(
            name=project_name,
            description=project_description,
            assessment_types=assessment_types
        )
        db.session.add(new_project)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "An error occurred during project creation.", "error": str(e)}), 500

    return jsonify({"msg": "Project created successfully"}), 201

@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    result = [
        {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'assessment_types': project.assessment_types.split(',')  # Convert comma-separated values back to list
        }
        for project in projects
    ]
    return jsonify(result)


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

app.config['UPLOAD_FOLDER'] = './uploads'
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024  # 1000MB limit
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Create uploads folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

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

@app.route('/api/responses', methods=['POST'])
def submit_assessment():
    try:
        responses = request.form.to_dict(flat=False)
        files = request.files

        # Group responses by question_id
        grouped_responses = {}
        for key, value in responses.items():
            if key.endswith('[question_id]'):
                q_index = key.split('[')[1].split(']')[0]
                question_id = value[0]
                option_id = responses.get(f'responses[{q_index}][option_id]', [None])[0]
                response_comment = responses.get(f'responses[{q_index}][response_comment]', [None])[0]
                
                grouped_responses[question_id] = {
                    'option_id': option_id,
                    'response_comment': response_comment,
                    'q_index': q_index
                }

        # Process and save responses
        for question_id, response_data in grouped_responses.items():
            file = files.get(f'responses[{response_data["q_index"]}][response_file]', None)
            response_file_name = None
            if file and file.filename != '':
                if allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    response_file_name = filename

            # Check if a response for this question already exists
            existing_response = Response.query.filter_by(question_id=question_id).first()

            if existing_response:
                # Update existing response
                existing_response.option_id = response_data['option_id']
                existing_response.response_comment = response_data['response_comment']
                if response_file_name:
                    existing_response.response_file = response_file_name
            else:
                # Create new response
                new_response = Response(
                    question_id=question_id,
                    option_id=response_data['option_id'],
                    response_comment=response_data['response_comment'],
                    response_file=response_file_name
                )
                db.session.add(new_response)

        db.session.commit()
        return jsonify({"message": "Assessment submitted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error occurred:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)



