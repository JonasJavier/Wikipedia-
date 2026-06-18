from .util import get_entry, list_entries, save_entry
import markdown, random
from django.shortcuts import render, redirect
from django.contrib import messages
from . import util
from .util import get_entry, delete_entry
from django.http import HttpResponseServerError


def md_to_html(title):
    """Convierte el contenido Markdown a HTML."""
    content = get_entry(title)
    if content is None:
        return None
    else:
        markdowner = markdown.Markdown()
        return markdowner.convert(content)

def index(request):
    """Renderiza la página de inicio."""
    return render(request, "encyclopedia/index.html", {
        "entries": list_entries()
    })

def info(request, title):
    html_content = md_to_html(title)
    if html_content is None:
        error_message = "The requested page was not found."
        return render(request, "encyclopedia/error.html", {'error_message': error_message})
    else:
        return render(request, "encyclopedia/info.html", {'title': title, 'html_content': html_content})

def search(request):
    if request.method == 'GET':
        query = request.GET.get('q', '').strip()  
        if query:
            entries = list_entries()
            matching_entries = [entry for entry in entries if query.lower() in entry.lower()]
            if matching_entries:
                # Render search results page with matching entries
                return render(request, "encyclopedia/search_results.html", {'query': query, 'matching_entries': matching_entries})
            else:
                # If there are no matches, display an error message or redirect to index
                error_message = f'No entries matching "{query}" were found.'
                messages.error(request, error_message)
        else:
            # If no search term was provided, display an error message or redirect to index
            error_message = 'Please enter a search term.'
            messages.error(request, error_message)
    return redirect('index')


def create_page(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        if title and content:
            # Check if an entry with the same title already exists
            if get_entry(title):
                error_message = "An entry with the same title already exists. Please choose another title."
                return render(request, "encyclopedia/create_page.html", {'error_message': error_message})
            else:
                # Save the new entry
                save_entry(title, content)
                return redirect('info', title=title)
        else:
            error_message = "Please provide both the title and the content of the page."
            return render(request, "encyclopedia/create_page.html", {'error_message': error_message})
    else:
        return render(request, "encyclopedia/create_page.html")

    
def random_page(request):
    entries = util.list_entries()
    random_entry = random.choice(entries)
    return redirect('info', title=random_entry)

def edit_page(request, title):
    
    content = get_entry(title)
    if request.method == 'POST':
        
        new_content = request.POST.get('content')
       
        save_entry(title, new_content)
        
        return redirect('info', title=title)
    else:
        # Renderizar la plantilla de edición con el contenido actual de la página
        return render(request, 'encyclopedia/edit_page.html', {'title': title, 'content': content})
    
    
    
def delete_page(request, title):
    if request.method == 'POST':
        # Delete the entry
        if get_entry(title):
            delete_entry(title)
            messages.success(request, f'Page "{title}" has been deleted successfully.')
            return redirect('index')
        else:
            messages.error(request, f'Page "{title}" does not exist.')
            return redirect('index')
    else:
        return render(request, 'encyclopedia/delete_page.html', {'title': title})
    
    
def my_view(request):
    try:
        # Code that may raise encoding errors
        # For example:
        # some_data = some_text.encode('utf-8')
        some_html_content = "<p>Hello, <strong>World</strong>!</p>"
        return render(request, 'my_template.html', {'some_html_content': some_html_content})
    except UnicodeEncodeError as e:
        # Handle encoding errors gracefully
        error_message = "An encoding error occurred: " + str(e)
        return HttpResponseServerError(error_message)
    
def all_pages(request):
    entries = list_entries()
    return render(request, "encyclopedia/all_pages.html", {"entries": entries})