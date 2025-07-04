class ChecklistApp {
    constructor() {
        this.lists = JSON.parse(localStorage.getItem('checklists')) || [];
        this.currentListId = null;
        this.isEditing = false;
        this.editingData = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderLists();
    }

    initializeElements() {
        this.listScreen = document.getElementById('listScreen');
        this.detailScreen = document.getElementById('detailScreen');
        this.editScreen = document.getElementById('editScreen');
        
        this.listContainer = document.getElementById('listContainer');
        this.itemList = document.getElementById('itemList');
        this.editItems = document.getElementById('editItems');
        
        this.addListBtn = document.getElementById('addListBtn');
        this.backBtn = document.getElementById('backBtn');
        this.editBtn = document.getElementById('editBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.addItemBtn = document.getElementById('addItemBtn');
        
        this.listTitle = document.getElementById('listTitle');
        this.editTitle = document.getElementById('editTitle');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.listNameInput = document.getElementById('listNameInput');
    }

    bindEvents() {
        this.addListBtn.addEventListener('click', () => this.showEditScreen());
        this.backBtn.addEventListener('click', () => this.showListScreen());
        this.editBtn.addEventListener('click', () => this.showEditScreen(this.currentListId));
        this.resetBtn.addEventListener('click', () => this.resetList());
        this.cancelBtn.addEventListener('click', () => this.cancelEdit());
        this.saveBtn.addEventListener('click', () => this.saveList());
        this.addItemBtn.addEventListener('click', () => this.addEditItem());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveData() {
        localStorage.setItem('checklists', JSON.stringify(this.lists));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showListScreen() {
        this.listScreen.classList.remove('hidden');
        this.detailScreen.classList.add('hidden');
        this.editScreen.classList.add('hidden');
    }

    showDetailScreen(listId) {
        this.currentListId = listId;
        const list = this.lists.find(l => l.id === listId);
        if (!list) return;

        this.listTitle.textContent = list.name;
        this.renderItems(list);
        this.updateProgress(list);

        this.listScreen.classList.add('hidden');
        this.detailScreen.classList.remove('hidden');
        this.editScreen.classList.add('hidden');
    }

    showEditScreen(listId = null) {
        this.isEditing = !!listId;
        
        if (this.isEditing) {
            const list = this.lists.find(l => l.id === listId);
            this.editingData = JSON.parse(JSON.stringify(list));
            this.editTitle.textContent = 'リスト編集';
            this.listNameInput.value = list.name;
        } else {
            this.editingData = {
                id: this.generateId(),
                name: '',
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.editTitle.textContent = 'リスト作成';
            this.listNameInput.value = '';
        }

        this.renderEditItems();
        
        this.listScreen.classList.add('hidden');
        this.detailScreen.classList.add('hidden');
        this.editScreen.classList.remove('hidden');
    }

    renderLists() {
        this.listContainer.innerHTML = '';
        
        this.lists.forEach(list => {
            const checkedCount = list.items.filter(item => item.checked).length;
            const totalCount = list.items.length;
            
            const listElement = document.createElement('div');
            listElement.className = 'list-item';
            listElement.innerHTML = `
                <div class="list-info">
                    <h3>${this.escapeHtml(list.name)}</h3>
                    <p>${checkedCount}/${totalCount} 完了</p>
                </div>
                <div class="list-actions">
                    <button class="delete-btn" data-list-id="${list.id}">削除</button>
                </div>
            `;
            
            // リスト詳細表示のクリックイベント
            listElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    this.showDetailScreen(list.id);
                }
            });
            
            // 削除ボタンのクリックイベント
            const deleteBtn = listElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteList(list.id);
            });
            
            this.listContainer.appendChild(listElement);
        });
    }

    renderItems(list) {
        this.itemList.innerHTML = '';
        
        list.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `check-item ${item.checked ? 'checked' : ''}`;
            itemElement.innerHTML = `
                <input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''}>
                <label for="item-${item.id}">${this.escapeHtml(item.text)}</label>
            `;
            
            const checkbox = itemElement.querySelector('input');
            checkbox.addEventListener('change', () => {
                item.checked = checkbox.checked;
                itemElement.classList.toggle('checked', item.checked);
                this.updateProgress(list);
                this.saveData();
            });
            
            this.itemList.appendChild(itemElement);
        });
    }

    renderEditItems() {
        this.editItems.innerHTML = '';
        
        this.editingData.items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'edit-item';
            itemElement.innerHTML = `
                <input type="text" value="${this.escapeHtml(item.text)}" placeholder="項目名">
                <button class="remove-item-btn" data-index="${index}">削除</button>
            `;
            
            const input = itemElement.querySelector('input');
            input.addEventListener('input', () => {
                item.text = input.value;
            });
            
            const removeBtn = itemElement.querySelector('.remove-item-btn');
            removeBtn.addEventListener('click', () => {
                this.removeEditItem(index);
            });
            
            this.editItems.appendChild(itemElement);
        });
    }

    updateProgress(list) {
        const checkedCount = list.items.filter(item => item.checked).length;
        const totalCount = list.items.length;
        const percentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
        
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${checkedCount}/${totalCount}`;
    }

    resetList() {
        if (!this.currentListId) return;
        
        const list = this.lists.find(l => l.id === this.currentListId);
        if (!list) return;
        
        list.items.forEach(item => {
            item.checked = false;
        });
        
        this.renderItems(list);
        this.updateProgress(list);
        this.saveData();
    }

    deleteList(listId) {
        try {
            if (confirm('このリストを削除しますか？')) {
                this.lists = this.lists.filter(l => l.id !== listId);
                this.saveData();
                this.renderLists();
            }
        } catch (error) {
            console.error('リストの削除中にエラーが発生しました:', error);
            alert('リストの削除に失敗しました。');
        }
    }

    addEditItem() {
        this.editingData.items.push({
            id: this.generateId(),
            text: '',
            checked: false
        });
        this.renderEditItems();
    }

    removeEditItem(index) {
        this.editingData.items.splice(index, 1);
        this.renderEditItems();
    }

    cancelEdit() {
        if (this.currentListId) {
            this.showDetailScreen(this.currentListId);
        } else {
            this.showListScreen();
        }
    }

    saveList() {
        const name = this.listNameInput.value.trim();
        if (!name) {
            alert('リスト名を入力してください');
            return;
        }
        
        this.editingData.name = name;
        this.editingData.items = this.editingData.items.filter(item => item.text.trim());
        this.editingData.updatedAt = new Date().toISOString();
        
        if (this.isEditing) {
            const index = this.lists.findIndex(l => l.id === this.editingData.id);
            if (index !== -1) {
                this.lists[index] = this.editingData;
            }
        } else {
            this.lists.push(this.editingData);
        }
        
        this.saveData();
        this.renderLists();
        
        if (this.isEditing) {
            this.showDetailScreen(this.editingData.id);
        } else {
            this.showListScreen();
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChecklistApp;
} else {
    const app = new ChecklistApp();
}